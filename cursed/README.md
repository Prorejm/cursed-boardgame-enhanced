# 被诅咒的棋盘游戏 (Cursed Boardgame) - 升级版

> **原作者**: /u/chinesesilklanterns (Reddit)
> 
> **原始版本**: May 2020
>
> **升级版**: 2026 Enhanced Edition

---

## 关于原版

Cursed Boardgame Interactive NSFWCYOA 最初由 **/u/chinesesilklanterns** 于 2020 年 5 月创作。这是一个基于"蛇梯棋"玩法的互动式 CYOA（选择你的冒险）游戏，玩家通过掷骰子在棋盘上前进，遇到各种魔法事件改变自身属性。

原版 GitHub 仓库: [https://github.com/chinesesilklanterns/chinesesilklanterns.github.io](https://github.com/chinesesilklanterns/chinesesilklanterns.github.io)

---

## 升级内容 (v2.0 Enhanced)

本版本在原作基础上进行了大量改进和扩展：

### 🎯 棋盘扩展
| 项目 | 原版 | 升级版 |
|------|------|--------|
| 棋盘大小 | 10×10 (100格) | **12×12 (144格)** |
| 棋盘生成 | 硬编码 HTML | **动态 JavaScript 生成** |
| 事件类型 | 7种 | **9种 (新增: 休息站, 挑战格)** |

### 🎲 新骰子系统
- **1d6 (标准)** - 原版体验
- **2d3 (温和)** - 结果更稳定 (2-6)
- **1d8 (冒险)** - 最高可走8步
- **1d4 (安全)** - 风险更低
- 游戏中随时切换

### 💾 存档系统
- 使用浏览器 localStorage 自动/手动存档
- 支持 **继续游戏** 功能
- 游戏结束时自动保存

### 📜 事件日志
- 实时记录每一步操作
- 可切换显示/隐藏
- 保留最近 50 条记录

### 🆕 新事件
- **休息站**: 免费获得银币或属性提升
- **挑战格**: 属性检定，成功获得奖励

### 🌐 中文界面
- 全部 UI 文本中文化
- 保留原作英文角色名和术语

### ⚡ 技术改进
- 移除 jQuery 依赖，全部使用原生 JavaScript
- 移除 TAFFY 数据库库
- 代码更简洁高效

---

## 协议 / License

**原协议 (保留不变):**

You are free to use and redistribute this game, associated code and files entirely free of charge in a non-commercial setting, **so long as proper attribution is given to the original creator /u/chinesesilklanterns**.

I do not own the copyright to the illustrated images in the 'icons' folder used in this game, they belong to various artists found online.

You agree not to hold me responsible for any damages that may result from your use of these files, use at your own risk.

You may create derivative works, using all or parts of the files provided here, as long as the abovementioned acknowledgement is retained.

**简而言之**: 如果你分享或修改这个游戏，请注明原作者 /u/chinesesilklanterns。

---

## 运行方式

直接使用浏览器打开 `cursed/index.html` 即可游玩。

或部署到 GitHub Pages 等静态托管服务。

---

## 致谢

- 感谢 **/u/chinesesilklanterns** 创作了这款精彩的游戏
- 游戏中 'icons' 文件夹内的插画版权归各自艺术家所有
