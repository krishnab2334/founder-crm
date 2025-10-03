const OpenAI = require('openai');
const { pool } = require('../config/database');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI Service for generating suggestions
class AIService {
  // Analyze contact note and generate suggestions
  async analyzeContactNote(contactId, note, userId, workspaceId) {
    try {
      // Get contact details
      const [contacts] = await pool.query(
        'SELECT * FROM contacts WHERE id = ? AND workspace_id = ?',
        [contactId, workspaceId]
      );

      if (contacts.length === 0) {
        throw new Error('Contact not found');
      }

      const contact = contacts[0];

      // Create AI prompt
      const prompt = `
You are an AI assistant for a CRM system. Analyze the following note about a contact and provide actionable suggestions.

Contact Information:
- Name: ${contact.name}
- Type: ${contact.type}
- Company: ${contact.company || 'N/A'}

Note: "${note}"

Based on this note, provide:
1. Suggested follow-up tasks (max 2)
2. Suggested tags for this contact (max 3)
3. Priority level (low, medium, high, urgent)
4. Recommended timeline for follow-up

Return your response in JSON format:
{
  "tasks": [{"title": "Task title", "description": "Task description", "priority": "medium", "category": "sales"}],
  "tags": ["tag1", "tag2"],
  "priority": "medium",
  "followUpDays": 7,
  "summary": "Brief summary of the note and suggested actions"
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      const responseText = completion.choices[0].message.content;
      
      // Parse JSON response
      let suggestions;
      try {
        suggestions = JSON.parse(responseText);
      } catch (e) {
        // If JSON parsing fails, return a default structure
        suggestions = {
          tasks: [],
          tags: [],
          priority: 'medium',
          followUpDays: 7,
          summary: responseText
        };
      }

      // Store suggestion in database
      await pool.query(
        `INSERT INTO ai_suggestions (workspace_id, user_id, suggestion_type, context_type, context_id, suggestion_text, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [workspaceId, userId, 'contact_analysis', 'contact', contactId, 
         suggestions.summary || 'AI analyzed the note', JSON.stringify(suggestions)]
      );

      return suggestions;
    } catch (error) {
      console.error('AI analyze contact note error:', error);
      throw error;
    }
  }

  // Prioritize tasks using AI
  async prioritizeTasks(userId, workspaceId) {
    try {
      // Get pending tasks
      const [tasks] = await pool.query(
        `SELECT t.*, c.name as contact_name
         FROM tasks t
         LEFT JOIN contacts c ON t.contact_id = c.id
         WHERE t.workspace_id = ? AND t.assigned_to = ? AND t.status IN ('todo', 'in_progress')
         ORDER BY t.due_date ASC
         LIMIT 20`,
        [workspaceId, userId]
      );

      if (tasks.length === 0) {
        return { prioritizedTasks: [], summary: 'No tasks to prioritize' };
      }

      // Create AI prompt
      const tasksText = tasks.map((t, i) => 
        `${i + 1}. ${t.title} (Due: ${t.due_date || 'No date'}, Priority: ${t.priority}, Category: ${t.category})`
      ).join('\n');

      const prompt = `
You are an AI task prioritization assistant. Analyze the following tasks and suggest the order they should be completed based on urgency, importance, and dependencies.

Tasks:
${tasksText}

Provide a prioritized list with brief reasoning. Return in JSON format:
{
  "prioritizedOrder": [task_ids in order],
  "topPriority": [top 3 task_ids],
  "reasoning": "Brief explanation of prioritization strategy",
  "recommendations": "Any general recommendations"
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600
      });

      const responseText = completion.choices[0].message.content;
      
      let suggestions;
      try {
        suggestions = JSON.parse(responseText);
      } catch (e) {
        suggestions = {
          prioritizedOrder: tasks.map(t => t.id),
          topPriority: tasks.slice(0, 3).map(t => t.id),
          reasoning: responseText,
          recommendations: 'Focus on high-priority tasks first'
        };
      }

      // Store suggestion
      await pool.query(
        `INSERT INTO ai_suggestions (workspace_id, user_id, suggestion_type, context_type, context_id, suggestion_text, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [workspaceId, userId, 'task_prioritization', 'user', userId, 
         suggestions.reasoning || 'AI prioritized your tasks', JSON.stringify(suggestions)]
      );

      return suggestions;
    } catch (error) {
      console.error('AI prioritize tasks error:', error);
      throw error;
    }
  }

  // Generate follow-up email draft
  async generateFollowUpEmail(contactId, context, userId, workspaceId) {
    try {
      // Get contact details
      const [contacts] = await pool.query(
        'SELECT * FROM contacts WHERE id = ? AND workspace_id = ?',
        [contactId, workspaceId]
      );

      if (contacts.length === 0) {
        throw new Error('Contact not found');
      }

      const contact = contacts[0];

      // Get recent interactions
      const [interactions] = await pool.query(
        `SELECT * FROM interactions WHERE contact_id = ? ORDER BY interaction_date DESC LIMIT 3`,
        [contactId]
      );

      const interactionsText = interactions.map(i => 
        `${i.type}: ${i.notes}`
      ).join('\n');

      const prompt = `
You are an AI email assistant for a startup founder. Draft a professional follow-up email for the following contact:

Contact: ${contact.name}
Company: ${contact.company || 'N/A'}
Type: ${contact.type}

Recent interactions:
${interactionsText || 'No recent interactions'}

Context: ${context}

Write a friendly but professional follow-up email. Keep it concise and actionable.
Return in JSON format:
{
  "subject": "Email subject",
  "body": "Email body text"
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 400
      });

      const responseText = completion.choices[0].message.content;
      
      let email;
      try {
        email = JSON.parse(responseText);
      } catch (e) {
        email = {
          subject: `Follow up with ${contact.name}`,
          body: responseText
        };
      }

      return email;
    } catch (error) {
      console.error('AI generate email error:', error);
      throw error;
    }
  }

  // Categorize contact automatically
  async categorizeContact(contactData) {
    try {
      const { name, email, company, notes } = contactData;

      const prompt = `
Analyze this contact and suggest the most appropriate type and tags:

Name: ${name}
Email: ${email || 'N/A'}
Company: ${company || 'N/A'}
Notes: ${notes || 'N/A'}

Return in JSON format:
{
  "type": "customer|investor|partner|lead",
  "tags": ["tag1", "tag2", "tag3"],
  "reasoning": "Brief explanation"
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });

      const responseText = completion.choices[0].message.content;
      
      let suggestions;
      try {
        suggestions = JSON.parse(responseText);
      } catch (e) {
        suggestions = {
          type: 'lead',
          tags: ['new'],
          reasoning: 'Default categorization'
        };
      }

      return suggestions;
    } catch (error) {
      console.error('AI categorize contact error:', error);
      throw error;
    }
  }

  // Summarize long notes
  async summarizeNotes(notes) {
    try {
      if (!notes || notes.length < 200) {
        return notes; // No need to summarize short notes
      }

      const prompt = `
Summarize the following notes concisely, keeping the key points:

${notes}

Provide a clear, bullet-point summary.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 300
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('AI summarize notes error:', error);
      throw error;
    }
  }

  // Predict deal conversion
  async predictDealConversion(dealId, workspaceId) {
    try {
      // Get deal and contact info
      const [deals] = await pool.query(
        `SELECT d.*, c.name as contact_name, c.type as contact_type
         FROM deals d
         LEFT JOIN contacts c ON d.contact_id = c.id
         WHERE d.id = ? AND d.workspace_id = ?`,
        [dealId, workspaceId]
      );

      if (deals.length === 0) {
        throw new Error('Deal not found');
      }

      const deal = deals[0];

      // Get interactions count
      const [interactions] = await pool.query(
        'SELECT COUNT(*) as count FROM interactions WHERE contact_id = ?',
        [deal.contact_id]
      );

      const prompt = `
Analyze this sales deal and predict the likelihood of conversion:

Deal: ${deal.title}
Stage: ${deal.stage}
Value: $${deal.value}
Contact Type: ${deal.contact_type}
Interactions: ${interactions[0].count}
Expected Close: ${deal.expected_close_date || 'Not set'}

Return in JSON format:
{
  "conversionProbability": 0-100,
  "confidence": "low|medium|high",
  "keyFactors": ["factor1", "factor2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "reasoning": "Brief explanation"
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 400
      });

      const responseText = completion.choices[0].message.content;
      
      let prediction;
      try {
        prediction = JSON.parse(responseText);
      } catch (e) {
        prediction = {
          conversionProbability: 50,
          confidence: 'medium',
          keyFactors: [],
          recommendations: [],
          reasoning: responseText
        };
      }

      return prediction;
    } catch (error) {
      console.error('AI predict deal conversion error:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
