# middle_check_new

这是新的课题演示系统。

**【运行项目】**

NOTE：page4是项目中期指标性能测试，需要把视频放middle_check.mp4放到public文件夹中。

1. 安装node.js ~~16.15.1 版本~~ 和 最新的npm
2. 安装依赖： `npm install --legacy-peer-deps`（不加 --legacy-peer-deps 会有依赖冲突报错）
3. 运行项目：
   * 开发模式：`npm run dev`
   * 构建项目：`npm run build`
   * 生产模式运行：`npm run start`



**【安装nodejs和npm】**
```
# ubuntu安装nodejs(npm)方法(without sudo)：
# https://cloud.tencent.com/developer/article/1783823

wget https://nodejs.org/dist/v18.20.6/node-v18.20.6-linux-x64.tar.gz

mkdir -p ~/apps/node-18.20.6

tar -xJf node-v18.20.6-linux-x64.tar.xz --no-wildcards-match-slash --anchored --exclude */CHANGELOG.md --exclude */LICENSE --exclude */README.md  --strip 1 -C ~/apps/node-18.20.6/

# 打开 .bashrc 添加进入，然后source
export PATH=~/apps/node-18.20.6/bin:$PATH

# 检查
node -v
npm -v
```




# 面向复杂场景的图计算机演示系统（中期-前端）



## 项目结构

```tree
middle_check_new/
├── src/
│   ├── app/                    # 主应用目录 (Next.js App Router)
│   │   ├── dashboard/          # 仪表板页面
│   │   │   ├── part1/          # FPGA芯片性能演示
│   │   │   ├── part2/          # 软硬一体模拟器演示
│   │   │   └── part3/          # 真实场景分布式图计算
│   │   ├── layout.tsx          # 全局布局
│   │   └── page.tsx            # 主页重定向
│   ├── components/             # 通用组件库
│   │   ├── common/             
│   │   ├── core/              
│   │   └── dashboard/         
│   ├── lib/                    
│   │   └── request/           
│   ├── styles/                 
│   │   ├── global.css         
│   │   └── theme/             
│   ├── types/                  
│   └── paths.ts                # 应用路径配置
├── public/                     # 静态资源
└── next.config.mjs             # Next.js配置
```
