// 测试新增管理区功能 - 包含所有字段
const axios = require('axios');

async function testCreateManagementArea() {
  console.log('🧪 测试新增管理区功能...\n');
  
  const baseURL = 'http://192.168.1.10:3000';
  const headers = {
    'Authorization': 'mock-token',
    'Content-Type': 'application/json'
  };
  
  // 测试数据 - 包含所有前端字段
  const testData = {
    name: '测试管理区完整版',
    area_id: 'TEST-' + Date.now(),
    address: '测试地址123号',
    description: '这是一个包含所有字段的测试管理区',
    low_building_count: 5,
    high_building_count: 3,
    build_area: 15000.50,
    land_area: 25000.75,
    public_area: 3000.25,
    green_area: 5000.00,
    road_area: 2000.50,
    parking_area: 1500.25,
    garage_area: 800.00
  };
  
  try {
    console.log('📤 发送数据:', JSON.stringify(testData, null, 2));
    
    // 创建新管理区
    const createResponse = await axios.post(`${baseURL}/api/gardens`, testData, { headers });
    console.log('✅ 创建成功!');
    console.log('📥 返回数据:', JSON.stringify(createResponse.data, null, 2));
    
    const newId = createResponse.data.id;
    console.log(`🆔 新管理区ID: ${newId}\n`);
    
    // 验证数据是否正确保存
    console.log('🔍 验证保存的数据...');
    const getResponse = await axios.get(`${baseURL}/api/gardens`, { headers });
    const savedArea = getResponse.data.find(area => area.id === newId);
    
    if (savedArea) {
      console.log('✅ 数据验证成功!');
      console.log('💾 保存的数据:', JSON.stringify(savedArea, null, 2));
      
      // 检查每个字段
      const fieldChecks = [
        { field: 'name', expected: testData.name, actual: savedArea.name },
        { field: 'area_id', expected: testData.area_id, actual: savedArea.area_id },
        { field: 'address', expected: testData.address, actual: savedArea.address },
        { field: 'description', expected: testData.description, actual: savedArea.description },
        { field: 'low_building_count', expected: testData.low_building_count, actual: savedArea.low_building_count },
        { field: 'high_building_count', expected: testData.high_building_count, actual: savedArea.high_building_count },
        { field: 'build_area', expected: testData.build_area, actual: parseFloat(savedArea.build_area) },
        { field: 'land_area', expected: testData.land_area, actual: parseFloat(savedArea.land_area) },
        { field: 'public_area', expected: testData.public_area, actual: parseFloat(savedArea.public_area) },
        { field: 'green_area', expected: testData.green_area, actual: parseFloat(savedArea.green_area) },
        { field: 'road_area', expected: testData.road_area, actual: parseFloat(savedArea.road_area) },
        { field: 'parking_area', expected: testData.parking_area, actual: parseFloat(savedArea.parking_area) },
        { field: 'garage_area', expected: testData.garage_area, actual: parseFloat(savedArea.garage_area) }
      ];
      
      console.log('\n📋 字段验证结果:');
      fieldChecks.forEach(check => {
        const isMatch = check.expected === check.actual;
        const status = isMatch ? '✅' : '❌';
        console.log(`${status} ${check.field}: ${check.expected} → ${check.actual} ${isMatch ? '' : '(不匹配)'}`);
      });
      
    } else {
      console.log('❌ 未找到保存的数据');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testCreateManagementArea();
