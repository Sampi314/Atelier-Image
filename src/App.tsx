/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiKeyGate } from './components/ApiKeyGate';
import { BatchGenerator } from './components/BatchGenerator';
import { SiteChrome } from './components/SiteChrome';

export default function App() {
  return (
    <SiteChrome>
      <ApiKeyGate>
        <BatchGenerator />
      </ApiKeyGate>
    </SiteChrome>
  );
}
