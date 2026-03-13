/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CreateSlider from './pages/CreateSlider';
import ViewSlider from './pages/ViewSlider';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CreateSlider />} />
          <Route path="slider/:id" element={<ViewSlider />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
