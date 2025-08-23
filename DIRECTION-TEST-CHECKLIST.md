# Direction Switch Manual Checklist

1. Run the client locally with `npm run dev:client`.
2. Open the application in the browser.
3. Use the language switcher to toggle between **English (EN)** and **Arabic (AR)**.
4. After switching to **AR**:
   - Verify that the `<html>` element has `dir="rtl"`.
   - Confirm menus, flex containers, and grids flip to right-to-left layout.
5. Switch back to **EN**:
   - Ensure `<html dir="ltr">`.
   - Confirm layouts return to left-to-right with no RTL artifacts.
6. Repeat on key pages (dashboard, forms, navigation) to validate consistent direction handling.
