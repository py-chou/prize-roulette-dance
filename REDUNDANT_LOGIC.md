# 專案冗余邏輯分析報告

## 1. 未使用的組件（完全冗余）

### 1.1 `AvatarRow.tsx` 組件 ✅ 已刪除
- **位置**: `src/components/AvatarRow.tsx` (已刪除)
- **問題**: 與 `PixiAvatarRow.tsx` 功能相同，但專案中只使用了 `PixiAvatarRow`
- **處理**: 
  - 已將 `SpinPhase` 類型移到 `src/types/participant.ts`
  - 已更新相關導入
  - 已刪除 `AvatarRow.tsx`

### 1.2 `DrawingPopup.tsx` 組件 ✅ 已刪除
- **位置**: `src/components/DrawingPopup.tsx` (已刪除)
- **問題**: 與 `DrawInProgressPopup.tsx` 功能相似，但專案中只使用了 `DrawInProgressPopup`
- **處理**: 已刪除 `DrawingPopup.tsx`

---

## 2. 重複的邏輯代碼

### 2.1 `LotteryDraw.tsx` 中的抽獎邏輯重複
- **位置**: `src/components/LotteryDraw.tsx`
- **問題**: `handleStartDraw` 和 `handleRedraw` 函數包含大量重複邏輯
- **重複內容**:
  ```typescript
  // 兩個函數都包含：
  - timeout 清理邏輯
  - 設置 phase 和 spinPhase
  - 設置 showDrawInProgress
  - setTimeout 2500ms 後選擇獲獎者
  - 設置 winners 和 phase
  - 延遲隱藏 DrawInProgressPopup
  ```
- **建議**: 提取共同邏輯到 `startDrawProcess` 函數，兩個處理函數調用它

### 2.2 Avatar 生成邏輯重複
- **位置**: 
  - `src/components/AvatarRow.tsx` (line 22-40)
  - `src/components/PixiAvatarRow.tsx` (line 49-65)
- **問題**: 兩個組件中都有相同的 `getEnoughParticipants` 邏輯
- **重複內容**:
  ```typescript
  - MIN_AVATARS_PER_ROW = 20 常數定義
  - 參與者複製邏輯（確保至少 20 個）
  - ID 計數器邏輯
  - 三倍複製以實現無縫循環
  ```
- **建議**: 提取到 `src/utils/participantUtils.ts` 作為共享工具函數

### 2.3 Winner Avatar 渲染邏輯重複
- **位置**:
  - `src/components/WinnerCard.tsx` (line 15-16, 43-56)
  - `src/components/WinnerReveal.tsx` (line 172-177) - 列表模式
  - `src/components/AddWinnerPopup.tsx` (line 148-151)
- **問題**: 多處重複使用 `generateAvatarColor` 和 `generateAvatarLetter`，並有相似的樣式
- **重複內容**:
  ```typescript
  - generateAvatarColor(winner.id)
  - generateAvatarLetter(winner.id, winner.name)
  - 圓形背景樣式
  - 邊框樣式
  ```
- **建議**: 創建 `AvatarDisplay` 組件統一處理

### 2.4 關閉按鈕樣式重複
- **位置**:
  - `src/components/WinnerReveal.tsx` (line 83-91)
  - `src/components/AddWinnerPopup.tsx` (line 42-47)
  - `src/components/AddWinnerCountPopup.tsx` (line 93-98)
- **問題**: 多個彈窗組件使用相同的關閉按鈕樣式和結構
- **重複內容**:
  ```tsx
  <button
    onClick={onClose}
    className="absolute top-X right-X p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
  >
    <X className="w-4 h-4" />
  </button>
  ```
- **建議**: 創建 `CloseButton` 組件

### 2.5 Backdrop 樣式重複
- **位置**:
  - `src/components/WinnerReveal.tsx` (line 68-75)
  - `src/components/AddWinnerPopup.tsx` (line 25-31)
  - `src/components/AddWinnerCountPopup.tsx` (line 76-82)
  - `src/components/DrawInProgressPopup.tsx` (line 59-64)
- **問題**: 多個彈窗使用相似的 backdrop 樣式
- **重複內容**:
  ```tsx
  <motion.div
    className="absolute inset-0 bg-background/80 backdrop-blur-md"
    // 或類似的變體
  />
  ```
- **建議**: 創建 `ModalBackdrop` 組件

### 2.6 狀態重置邏輯重複
- **位置**: `src/components/LotteryDraw.tsx`
- **問題**: `handleReset` 和 `handleCloseReveal` 中有部分重複的狀態重置邏輯
- **重複內容**:
  ```typescript
  setPhase('idle');
  setSpinPhase('idle');
  setWinners([]);
  setShowDrawInProgress(false);
  ```
- **建議**: 提取到 `resetDrawState` 函數

### 2.7 獲取剩餘參與者邏輯重複
- **位置**: `src/components/LotteryDraw.tsx`
- **問題**: `handleAddWinner` 和 `handleConfirmAddWinnerCount` 中重複計算剩餘參與者
- **重複內容**:
  ```typescript
  const winnerIds = new Set(winners.map(w => w.id));
  const remainingParticipants = participants.filter(p => !winnerIds.has(p.id));
  ```
- **建議**: 提取到 `getRemainingParticipants` 工具函數

### 2.8 PixiJS 清理邏輯重複
- **位置**: `src/components/PixiAvatarRow.tsx`
- **問題**: 清理邏輯在多個 useEffect 中重複出現
- **重複內容**:
  - 停止動畫幀
  - 移除容器
  - 銷毀對象
  - 錯誤處理
- **建議**: 提取到 `cleanupPixiContainer` 工具函數

### 2.9 ResizeObserver 邏輯重複
- **位置**:
  - `src/components/PixiAvatarRow.tsx` (line 469-500)
  - `src/hooks/usePixiApp.tsx` (line 47-76)
- **問題**: 兩個地方都有相似的 ResizeObserver 設置邏輯
- **建議**: 統一在 `usePixiApp` hook 中處理，或提取為共享邏輯

---

## 3. 重複的常數定義

### 3.1 動畫持續時間
- **位置**: 多個組件
- **問題**: 2500ms、200ms 等時間常數在多處硬編碼
- **建議**: 提取到 `src/constants/animation.ts`

### 3.2 顏色值
- **位置**: 
  - `src/utils/avatarUtils.ts` (line 4-21)
  - `src/utils/generateParticipants.ts` (line 17-20)
- **問題**: 兩處定義了不同的顏色數組
- **建議**: 統一顏色定義到一個常數文件

---

## 4. 重複的動畫效果

### 4.1 發光動畫效果
- **位置**:
  - `src/components/WinnerCard.tsx` (line 27-41, 44-48)
  - `src/components/AddWinnerPopup.tsx` (line 78-143)
- **問題**: 多處實現相似的發光/脈衝動畫
- **建議**: 提取為可重用的動畫組件或樣式類

### 4.2 漸變文字樣式
- **位置**: 多個組件
- **問題**: `text-gradient-gold` 類在多處使用，但可能定義重複
- **建議**: 確認在 CSS 中統一定義

---

## 5. 重複的類型檢查和驗證

### 5.1 參與者數量驗證
- **位置**: `src/components/AddWinnerCountPopup.tsx`
- **問題**: 數量驗證邏輯在 `handleInputChange` 和 `handleInputBlur` 中重複
- **建議**: 提取到 `validateCount` 函數

---

## 6. 建議的優化優先級

### 高優先級（影響維護性）
1. ✅ 刪除未使用的組件（`AvatarRow.tsx`, `DrawingPopup.tsx`）
2. ✅ 提取 `handleStartDraw` 和 `handleRedraw` 的共同邏輯
3. ✅ 提取 avatar 生成邏輯到工具函數
4. ✅ 創建 `AvatarDisplay` 組件統一處理 winner avatar

### 中優先級（改善代碼組織）
5. ✅ 創建 `CloseButton` 和 `ModalBackdrop` 組件
6. ✅ 提取狀態重置邏輯
7. ✅ 提取剩餘參與者計算邏輯
8. ✅ 統一常數定義

### 低優先級（代碼美化）
9. ✅ 提取 PixiJS 清理邏輯
10. ✅ 統一 ResizeObserver 處理
11. ✅ 提取動畫效果為可重用組件

---

## 7. 統計摘要

- **未使用組件**: 2 個
- **重複邏輯塊**: 9 處
- **重複常數定義**: 2 處
- **重複動畫效果**: 2 處
- **重複驗證邏輯**: 1 處

**總計**: 約 16 處冗余邏輯需要優化

