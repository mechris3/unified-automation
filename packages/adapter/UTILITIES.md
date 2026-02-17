# Adapter Utilities

## Wait Utilities

### waitForCondition
Polls a condition with custom predicates.

```typescript
import { waitForCondition } from '@unified-automation/adapter';

await waitForCondition(
  () => adapter.getText('.status'),
  (text) => text === 'Complete',
  { timeout: 5000 }
);
```

## Tool-Specific Utilities

### Puppeteer
```typescript
import { PuppeteerUtils } from '@unified-automation/adapter';

await PuppeteerUtils.clickWithAngularSupport(page, '.button');
```

### Playwright
```typescript
import { PlaywrightUtils } from '@unified-automation/adapter';

await PlaywrightUtils.scrollIntoViewAndClick(page, '.button');
```

## Base Classes

### BasePage
```typescript
import { BasePage } from '@unified-automation/adapter';

export class MyPage extends BasePage {
  async doSomething() {
    await this.waitForVisible('.element');
  }
}
```
