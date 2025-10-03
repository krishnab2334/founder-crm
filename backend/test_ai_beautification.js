const aiService = require('./src/services/aiService');
require('dotenv').config();

// Test data
const testTaskData = {
  title: "Follow up with ABC Corp about partnership deal",
  description: "Need to discuss terms and pricing for the Q1 partnership agreement",
  category: "sales",
  priority: "high",
  assigned_to_name: "John Smith"
};

const testUpdateData = {
  status: "completed",
  oldStatus: "in_progress"
};

const testUserInfo = {
  name: "John Smith"
};

// Test the AI beautification
async function testAIBeautification() {
  console.log('🤖 Testing AI Status Message Beautification...\n');
  
  console.log('📋 Test Data:');
  console.log('Task:', testTaskData.title);
  console.log('Category:', testTaskData.category);
  console.log('Priority:', testTaskData.priority);
  console.log('Status Change:', `${testUpdateData.oldStatus} → ${testUpdateData.status}`);
  console.log('Updated by:', testUserInfo.name);
  console.log('\n' + '='.repeat(60) + '\n');
  
  try {
    const result = await aiService.beautifyTaskStatusMessage(
      testTaskData, 
      testUpdateData, 
      testUserInfo
    );
    
    console.log('✨ AI-Enhanced Result:');
    console.log('Beautified Message:', result.beautifiedMessage);
    console.log('Summary:', result.summary);
    console.log('Priority:', result.priority);
    console.log('Category:', result.category);
    console.log('Action Type:', result.actionType);
    console.log('Timestamp:', result.timestamp);
    
  } catch (error) {
    console.error('❌ AI Beautification failed:', error.message);
    console.log('\n📝 This is expected if OpenAI API key is not configured.');
    console.log('The system will use fallback messages in production.');
  }
}

// Test different scenarios
async function runAllTests() {
  const scenarios = [
    {
      name: "High Priority Sales Task Completion",
      taskData: {
        title: "Close deal with TechCorp",
        description: "Finalize contract and get signatures",
        category: "sales",
        priority: "urgent",
        assigned_to_name: "Sarah Johnson"
      },
      updateData: { status: "completed", oldStatus: "in_progress" },
      userInfo: { name: "Sarah Johnson" }
    },
    {
      name: "Product Development Task Started",
      taskData: {
        title: "Implement user authentication system",
        description: "Add OAuth and JWT-based authentication",
        category: "product",
        priority: "medium",
        assigned_to_name: "Mike Chen"
      },
      updateData: { status: "in_progress", oldStatus: "todo" },
      userInfo: { name: "Mike Chen" }
    },
    {
      name: "Operations Task Blocked",
      taskData: {
        title: "Set up new server infrastructure",
        description: "Deploy production environment on AWS",
        category: "operations",
        priority: "high",
        assigned_to_name: "Alex Rodriguez"
      },
      updateData: { status: "cancelled", oldStatus: "in_progress" },
      userInfo: { name: "Alex Rodriguez" }
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await aiService.beautifyTaskStatusMessage(
        scenario.taskData,
        scenario.updateData,
        scenario.userInfo
      );
      
      console.log('✅ Success!');
      console.log('Message:', result.beautifiedMessage);
      console.log('Summary:', result.summary);
      
    } catch (error) {
      console.log('⚠️  Using fallback (AI not available)');
      console.log('Fallback message would be:', 
        `${scenario.userInfo.name} updated "${scenario.taskData.title}" to ${scenario.updateData.status}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the tests
if (require.main === module) {
  console.log('🚀 AI Status Beautification Test Suite');
  console.log('=====================================\n');
  
  runAllTests().then(() => {
    console.log('\n✅ All tests completed!');
    console.log('\n💡 To enable full AI functionality:');
    console.log('   1. Add OPENAI_API_KEY to your .env file');
    console.log('   2. Ensure you have OpenAI API credits');
    console.log('   3. Restart the application');
  }).catch(error => {
    console.error('❌ Test suite failed:', error);
  });
}

module.exports = { testAIBeautification, runAllTests };