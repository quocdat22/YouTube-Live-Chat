document.addEventListener('DOMContentLoaded', function () {
  const autoShowToggle = document.getElementById('auto-show-toggle');
  const toggleSwitch = document.querySelector('.toggle-switch');
  


  // Tải trạng thái khi mở popup
  async function loadToggleState() {
    try {
      const result = await chrome.storage.local.get(['autoShowOnFullscreen']);
      const storedValue = result.autoShowOnFullscreen;
      const isChecked = storedValue === true || storedValue === 'true';
      autoShowToggle.checked = isChecked;
    } catch (error) {
    }
  }

  // Lưu trạng thái
  async function saveToggleState() {
    try {
      const isChecked = autoShowToggle.checked;
      await chrome.storage.local.set({ autoShowOnFullscreen: isChecked });
      // Verify save
      const verify = await chrome.storage.local.get(['autoShowOnFullscreen']);
    } catch (error) {
    }
  }

  // Khởi tạo
  loadToggleState();

  autoShowToggle.addEventListener('change', function() {
    saveToggleState();
  });
});
