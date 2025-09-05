# 目录结构优化方案

## 建议的新目录结构

```
src/
├── api/                     # API接口层
├── assets/                  # 静态资源
├── components/              # 公共组件
│   ├── common/             # 通用组件
│   ├── layout/             # 布局组件
│   └── business/           # 业务组件
├── composables/            # 组合式函数
├── stores/                 # 状态管理
├── router/                 # 路由配置
├── utils/                  # 工具函数
├── types/                  # TypeScript类型定义
├── views/                  # 页面视图
│   ├── auth/               # 认证相关
│   │   └── Login.vue
│   ├── dashboard/          # 仪表板
│   │   └── Dashboard.vue
│   ├── customer/           # 客户管理
│   │   ├── Analytics.vue
│   │   ├── Certificate.vue
│   │   ├── Information.vue
│   │   └── NewInformation.vue
│   ├── finance/            # 财务管理
│   │   ├── Finance.vue
│   │   └── charging/
│   │       ├── CollectFee.vue
│   │       ├── FeeAdjust.vue
│   │       ├── MeterSettings.vue
│   │       └── ...
│   ├── resources/          # 资源管理
│   │   ├── Building.vue
│   │   ├── BuildingTree.vue
│   │   ├── Room.vue
│   │   └── Management.vue
│   ├── service/            # 服务管理
│   │   ├── Emergency.vue
│   │   ├── Public.vue
│   │   └── Repair.vue
│   ├── datahub/            # 数据中心
│   │   ├── FeeStatus.vue
│   │   └── RoomStatus.vue
│   └── maintenance/        # 维修管理
│       └── Daily.vue
├── App.vue
└── main.ts

server/
├── config/                 # 配置文件
│   ├── database.js
│   └── app.js
├── controllers/            # 控制器
├── middleware/             # 中间件
│   └── auth.js
├── models/                 # 数据模型
│   ├── Build.js
│   ├── Customer.js
│   ├── Garden.js
│   └── Room.js
├── routes/                 # 路由
│   ├── auth.js
│   ├── build.js
│   ├── customer.js
│   ├── garden.js
│   └── room.js
├── services/               # 业务逻辑层
├── utils/                  # 工具函数
└── app.js                  # 主应用文件

根目录/
├── docs/                   # 文档
├── scripts/                # 脚本文件
├── tests/                  # 测试文件
└── tools/                  # 开发工具
```

## 优化步骤

### 第一阶段：清理冗余文件
1. 删除备份文件 `MainLayout.vue.bak`
2. 合并重复功能文件
3. 删除空文件

### 第二阶段：重组视图文件
1. 按业务模块分组
2. 统一命名规范（使用PascalCase）
3. 创建子目录

### 第三阶段：优化服务器端结构
1. 统一文件命名规范
2. 分离配置和业务逻辑
3. 添加控制器层

### 第四阶段：添加必要目录
1. 创建类型定义目录
2. 添加测试目录
3. 完善文档结构

## 命名规范

### 前端文件命名
- Vue组件：PascalCase (如 `UserProfile.vue`)
- 目录：kebab-case (如 `user-profile/`)
- JavaScript/TypeScript：camelCase

### 后端文件命名
- 所有文件：camelCase (如 `userController.js`)
- 模型文件：PascalCase (如 `User.js`)

## 好处

1. **提高可维护性**：清晰的目录结构便于查找和修改代码
2. **增强可扩展性**：模块化设计便于添加新功能
3. **团队协作**：统一的规范减少沟通成本
4. **代码复用**：合理的组件分层提高复用率
