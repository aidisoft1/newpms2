const bcrypt = require('bcrypt');

// 1. 密码加密（哈希）
async function hashPassword(plainPassword) {
  // 工作因子：数值越大，哈希计算越慢（推荐10-12）
  const saltRounds = 10;
  
  try {
    // 生成哈希（自动生成盐值）
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    console.log('加密后的哈希值:', hash);
    return hash;
  } catch (error) {
    console.error('加密失败:', error);
    throw error;
  }
}

// 2. 密码验证（比对原始密码与哈希值）
async function verifyPassword(plainPassword, hash) {
  try {
    // 验证密码是否匹配
    const isMatch = await bcrypt.compare(plainPassword, hash);
    console.log('密码是否匹配:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('验证失败:', error);
    throw error;
  }
}

// 3. 使用示例
async function demo() {
  const originalPassword = 'User@123456'; // 原始密码
  
  // 加密密码
  const passwordHash = await hashPassword(originalPassword);
  
  // 验证正确密码
  await verifyPassword(originalPassword, passwordHash);
  
  // 验证错误密码
  await verifyPassword('WrongPassword', passwordHash);
}

// 执行演示
demo();
