# PixiJS 實現說明

## 概述

本專案已將原本使用 DOM 和 framer-motion 實現的動畫效果改用 PixiJS 來實現，以提升性能並避免 DOM 操作造成的效能問題。

## 實現的組件

### 1. `usePixiApp` Hook (`src/hooks/usePixiApp.tsx`)
- 提供 PixiJS Application 的 React 包裝器
- 自動處理應用初始化、清理和響應式調整
- 使用 ResizeObserver 優化性能

### 2. `PixiAvatarRow` (`src/components/PixiAvatarRow.tsx`)
- 替代原本的 `AvatarRow` 組件
- 使用 PixiJS 實現頭像滾動動畫
- 支持無限循環滾動
- 實現加速/減速動畫效果
- 在旋轉時應用模糊效果
- 使用 WebGL 渲染，性能優於 DOM 動畫

**主要特性：**
- 自動紋理加載和緩存
- 響應式大小調整
- 平滑的速度插值
- 圓形頭像遮罩

### 3. `PixiConfetti` (`src/components/PixiConfetti.tsx`)
- 替代原本使用 framer-motion 的彩紙粒子效果
- 使用 PixiJS 實現高性能粒子系統
- 支持多種顏色（金色、紫色、青色、紅色）
- 自動循環和淡入淡出效果

### 4. `PixiBackground` (`src/components/PixiBackground.tsx`)
- 替代原本的背景漸變動畫
- 使用 PixiJS Graphics 實現動態發光效果
- 在抽獎進行時顯示脈動光暈

## 性能優勢

1. **WebGL 渲染**：所有動畫使用 GPU 加速，性能遠優於 DOM 操作
2. **批量渲染**：PixiJS 可以批量處理大量精靈，減少繪製調用
3. **紋理緩存**：頭像紋理被緩存和重用，減少內存使用
4. **優化的動畫循環**：使用 requestAnimationFrame 實現流暢的 60fps 動畫

## 使用方式

### 在 LotteryDraw 中使用

```tsx
import { PixiAvatarRow } from './PixiAvatarRow';
import { PixiBackground } from './PixiBackground';

// 替換原本的 AvatarRow
<PixiAvatarRow
  participants={rowParticipants}
  direction={index % 2 === 0 ? 'left' : 'right'}
  spinPhase={spinPhase}
  phase={phase}
  rowIndex={index}
  totalRows={ROWS_COUNT}
/>

// 替換原本的背景動畫
<PixiBackground isSpinning={phase === 'spinning'} />
```

### 在 WinnerReveal 中使用

```tsx
import { PixiConfetti } from './PixiConfetti';

// 替換原本的 framer-motion 彩紙效果
<PixiConfetti isActive={isVisible} particleCount={20} />
```

## 技術細節

### 紋理加載
- 使用 `PIXI.Assets.load()` 異步加載頭像圖片
- 自動處理加載失敗，使用占位符替代
- 紋理被緩存在 `texturesRef` 中，避免重複加載

### 動畫系統
- 使用 `requestAnimationFrame` 實現動畫循環
- 速度插值使用線性插值（Lerp）實現平滑過渡
- 支持多種動畫狀態：idle、accelerating、peak、decelerating

### 響應式處理
- 使用 ResizeObserver 監聽容器大小變化
- 自動調整 PixiJS 渲染器大小
- 支持窗口大小變化

## 注意事項

1. **初始加載**：頭像紋理需要時間加載，首次顯示可能會有延遲
2. **內存管理**：組件卸載時會自動清理 PixiJS 資源
3. **瀏覽器兼容性**：需要支持 WebGL 的瀏覽器

## 未來優化建議

1. **代碼分割**：可以考慮使用動態導入來減少初始包大小
2. **紋理壓縮**：可以預先壓縮頭像圖片以減少內存使用
3. **對象池**：對於粒子系統，可以使用對象池來重用粒子對象
4. **性能監控**：可以添加 FPS 監控來追蹤性能


