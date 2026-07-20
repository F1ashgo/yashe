# About Page Business License Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/about`「荣誉与资质」区块顶部单独居中展示营业执照，并复用现有证书灯箱。

**Architecture:** 将营业执照 PNG 放入 `view/public`；在 `About.tsx` 中于证书网格上方单独渲染一张横版卡片；扩展 `selectedCertificate` 状态以同时服务执照与现有证书；在 `About.css` 增加居中横版卡片与横版灯箱宽度样式。

**Tech Stack:** React 18、TypeScript、Vite、现有 `About.css` 视觉语言（黑 / 金 / 奶油色）

## Global Constraints

- 营业执照单独一行居中，位于两张现有证书之上。
- 图片路径：`view/public/business-license.png`，页面引用 `/business-license.png`。
- 文案：类型 `资质认证`；标题 `营业执照`；说明 `广州雅舍室内设计有限公司 · 统一社会信用代码 91440115MAKBG4HD6A`。
- 不替换、不删除现有两张香港证书。
- 不新增路由、不改导航 / Footer / 后端。
- 点击灯箱、Escape / 遮罩 / 关闭按钮行为与现有证书一致。
- 源图：`C:\Users\司南寺木\.cursor\projects\d-CTEXT\assets\c__Users______AppData_Roaming_Cursor_User_workspaceStorage_5210bf9c6149021b5edc66723fae8cf3_images_9a1035caccd6fb32ebf9a9096d6c2e82-a5b3210c-e6d6-41ad-8002-0d68d4b5ef9c.png`

---

## File Structure

| 文件 | 职责 |
|------|------|
| `view/public/business-license.png` | 营业执照静态资源 |
| `view/src/pages/About.tsx` | 执照卡片数据与 DOM；共用灯箱状态 |
| `view/src/pages/About.css` | 横版居中卡片与横版灯箱样式 |

本仓库 `view` 当前无 Vitest；各任务以文件存在性检查 + `npm run build` + 手动 `/about` 验收替代单元测试。

---

### Task 1: 复制营业执照静态资源

**Files:**
- Create: `view/public/business-license.png`

**Interfaces:**
- Consumes: 源图绝对路径（见 Global Constraints）
- Produces: 可通过 `/business-license.png` 访问的静态文件

- [ ] **Step 1: 复制图片到 public**

```powershell
Copy-Item -LiteralPath "C:\Users\司南寺木\.cursor\projects\d-CTEXT\assets\c__Users______AppData_Roaming_Cursor_User_workspaceStorage_5210bf9c6149021b5edc66723fae8cf3_images_9a1035caccd6fb32ebf9a9096d6c2e82-a5b3210c-e6d6-41ad-8002-0d68d4b5ef9c.png" -Destination "d:\CTEXT\实习\yashe\view\public\business-license.png"
```

- [ ] **Step 2: 确认文件存在且非空**

```powershell
Get-Item "d:\CTEXT\实习\yashe\view\public\business-license.png" | Select-Object FullName, Length
```

Expected: `Length` 约 `133754`（或接近源图大小），路径正确。

- [ ] **Step 3: Commit**

```powershell
cd "d:\CTEXT\实习\yashe"
git add view/public/business-license.png
git commit -m "assets: add business license image for about page"
```

---

### Task 2: About 页加入营业执照卡片与灯箱数据

**Files:**
- Modify: `view/src/pages/About.tsx`

**Interfaces:**
- Consumes: `/business-license.png`
- Produces: `BUSINESS_LICENSE` 常量；执照卡片 DOM；`selectedCertificate` 可接收执照或证书

- [ ] **Step 1: 在 `CERTIFICATES` 上方增加执照常量，并抽出共用类型**

在 `About.tsx` 顶部将证书条目类型抽出，并新增执照常量：

```tsx
type CertificateItem = {
  type: string
  title: string
  issuer: string
  image: string
  theme: 'dark' | 'light'
  layout?: 'portrait' | 'landscape'
}

const BUSINESS_LICENSE: CertificateItem = {
  type: '资质认证',
  title: '营业执照',
  issuer: '广州雅舍室内设计有限公司 · 统一社会信用代码 91440115MAKBG4HD6A',
  image: '/business-license.png',
  theme: 'light',
  layout: 'landscape',
}

const CERTIFICATES: CertificateItem[] = [
  {
    type: '荣誉奖项',
    title: '杰出承建商大奖 2024 · 嘉许证书',
    issuer: '香港建造业议会',
    image: '/IMG_5395.JPG',
    theme: 'dark',
  },
  {
    type: '资质认证',
    title: '注册专业行业承造商证书',
    issuer: '香港建造业议会 · 室内装修专业资质',
    image: '/IMG_5396.JPG',
    theme: 'light',
  },
]
```

将 `useState` 类型改为：

```tsx
const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null)
```

- [ ] **Step 2: 在证书网格上方插入居中执照卡片**

在 `about-cert__header` 与 `cert-grid` 之间插入：

```tsx
<article className={`cert-card cert-card--${BUSINESS_LICENSE.theme} cert-card--landscape`}>
  <button
    type="button"
    className="cert-card__image"
    onClick={() => setSelectedCertificate(BUSINESS_LICENSE)}
    aria-label={`放大查看${BUSINESS_LICENSE.title}`}
  >
    <img src={BUSINESS_LICENSE.image} alt={BUSINESS_LICENSE.title} loading="lazy" />
    <span className="cert-card__zoom"><ZoomIn size={18} /> 点击查看大图</span>
  </button>
  <div className="cert-card__content">
    <span className="cert-card__type">{BUSINESS_LICENSE.type}</span>
    <h3>{BUSINESS_LICENSE.title}</h3>
    <p>{BUSINESS_LICENSE.issuer}</p>
  </div>
</article>
```

执照卡片外包一层以便居中：

```tsx
<div className="cert-license">
  {/* article 如上 */}
</div>
```

- [ ] **Step 3: 灯箱根据 layout 加宽**

将灯箱 body 的 className 改为：

```tsx
<div
  className={`cert-lightbox__body${selectedCertificate.layout === 'landscape' ? ' cert-lightbox__body--landscape' : ''}`}
  onClick={(event) => event.stopPropagation()}
>
```

- [ ] **Step 4: Commit**

```powershell
cd "d:\CTEXT\实习\yashe"
git add view/src/pages/About.tsx
git commit -m "feat: show centered business license on about honors section"
```

---

### Task 3: 横版执照与灯箱样式

**Files:**
- Modify: `view/src/pages/About.css`

**Interfaces:**
- Consumes: `.cert-license`、`.cert-card--landscape`、`.cert-lightbox__body--landscape`（Task 2 已写入 DOM）
- Produces: 居中横版卡片与加宽灯箱视觉效果

- [ ] **Step 1: 在 `.cert-grid` 规则前增加执照居中与横版卡片样式**

```css
.cert-license {
  max-width: 800px;
  margin: 0 auto 48px;
}

.cert-card--landscape .cert-card__image {
  height: auto;
  aspect-ratio: 16 / 10;
  background: #f3f1ec;
}
```

- [ ] **Step 2: 增加横版灯箱宽度**

在现有 `.cert-lightbox__body` 规则后追加：

```css
.cert-lightbox__body--landscape {
  max-width: min(1000px, 92vw);
}
```

- [ ] **Step 3: 移动端适配**

在 `@media (max-width: 768px)` 块内追加：

```css
.cert-license {
  margin-bottom: 32px;
  max-width: none;
}
```

- [ ] **Step 4: 构建验证**

```powershell
cd "d:\CTEXT\实习\yashe\view"
npm run build
```

Expected: TypeScript 与 Vite 构建成功，无报错。

- [ ] **Step 5: 手动验收（dev 已在跑则刷新即可）**

打开 `http://localhost:5173/about`（或当前 Vite 端口），确认：

1. 「荣誉与资质」标题下先看到居中营业执照，其下仍是两张香港证书
2. 执照图片完整、无裁切关键信息
3. 点击执照可灯箱放大；Escape / 遮罩 / 关闭可关
4. 缩小窗口后执照全宽、提示常显

- [ ] **Step 6: Commit**

```powershell
cd "d:\CTEXT\实习\yashe"
git add view/src/pages/About.css
git commit -m "style: add landscape layout for about business license"
```

---

## Spec Coverage Self-Review

| Spec 要求 | 对应任务 |
|-----------|----------|
| `business-license.png` 资源 | Task 1 |
| 单独居中、位于证书之上 | Task 2 + Task 3 |
| 文案与信用代码 | Task 2 `BUSINESS_LICENSE` |
| 复用灯箱 / Escape / 遮罩 | Task 2（沿用现有逻辑） |
| 横版比例与加宽灯箱 | Task 3 |
| 移动端全宽 | Task 3 |
| 不改动现有两张证书 | Task 2 仅在网格上方插入，不改 `CERTIFICATES` 内容 |

Placeholder scan: 无 TBD / TODO。  
类型一致性: `CertificateItem`、`layout: 'landscape'`、`cert-lightbox__body--landscape` 在 Task 2/3 对齐。
