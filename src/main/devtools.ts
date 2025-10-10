import { BrowserWindow, session } from 'electron'
import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'


/**
 * 自定义 devtools 字体，不然丑爆了！
 * @param mainWindow
 * @param font_size 字体大小
 */
export function devtools_custom_font(
  mainWindow: BrowserWindow,
  font_size: number = 12
) {
  mainWindow.webContents.on('devtools-opened', () => {
    const css = `
        :root {
            --sys-color-base: var(--ref-palette-neutral100);
            --source-code-font-family: JetBrains Maple Mono, consolas !important;
            --source-code-font-size: ${ font_size }px;
            --monospace-font-family: JetBrains Maple Mono, consolas !important;
            --monospace-font-size: ${ font_size }px;
            --default-font-family: JetBrains Maple Mono, system-ui, sans-serif;
            --default-font-size: ${ font_size }px;
            --ref-palette-neutral99: #ffffffff;
        }
        .theme-with-dark-background {
            --sys-color-base: var(--ref-palette-secondary25);
        }
        body {
            --default-font-family: JetBrains Maple Mono, system-ui,sans-serif;
        }
    `
    mainWindow.webContents.devToolsWebContents!.executeJavaScript(`
        const overriddenStyle = document.createElement('style');
        overriddenStyle.innerHTML = '${ css.replaceAll('\n', ' ') }';
        document.body.append(overriddenStyle);
        document.querySelectorAll('.platform-windows').forEach(el => el.classList.remove('platform-windows'));
        addStyleToAutoComplete();
        const observer = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const item = mutation.addedNodes[i];
                        if (item.classList.contains('editor-tooltip-host')) {
                            addStyleToAutoComplete();
                        }
                    }
                }
            }
        });
        observer.observe(document.body, {childList: true});
        function addStyleToAutoComplete() {
            document.querySelectorAll('.editor-tooltip-host').forEach(element => {
                if (element.shadowRoot.querySelectorAll('[data-key="overridden-dev-tools-font"]').length === 0) {
                    const overriddenStyle = document.createElement('style');
                    overriddenStyle.setAttribute('data-key', 'overridden-dev-tools-font');
                    overriddenStyle.innerHTML = '.cm-tooltip-autocomplete ul[role=listbox] {font-family:JetBrains Maple Mono, consolas !important;}';
                    element.shadowRoot.append(overriddenStyle);
                }
            });
        }
    `)
  })
}

/**
 * 加载谷歌扩展
 */
export function load_extensions() {
  installExtension(REACT_DEVELOPER_TOOLS).then(() => {
    session.defaultSession.getAllExtensions().map((e) => {
      session.defaultSession.loadExtension(e.path)
      console.log(`已加载扩展:  ${ e.name }`)
    })
  }).catch((err) => {
    console.log('无法加载扩展: ', err)
  })
}

