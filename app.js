// app.ts
const message = "TypeScriptの準備";
console.log(message);
/**
 * common.ts
 * ラグビーナビ 全ページ共通の機能
 */
class CommonFeatures {
    header;
    backToTopBtn;
    lastScrollY;
    constructor() {
        this.header = document.querySelector('.site-header');
        this.lastScrollY = window.scrollY;
        this.backToTopBtn = this.createBackToTopButton();
        this.init();
    }
    init() {
        this.initSmoothScroll();
        this.initScrollEvents();
        this.initLazyLoading();
    }
    /**
     * スムーススクロール（アンカーリンク押下時）
     */
    initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (!targetId || targetId === '#')
                    return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = this.header ? this.header.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth',
                    });
                }
            });
        });
    }
    /**
     * 「トップへ戻る」ボタンの生成
     */
    createBackToTopButton() {
        const btn = document.createElement('button');
        btn.innerHTML = '↑';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'トップへ戻る');
        // スタイルを動的に当てるか、CSSクラスに依存するか（今回はインライン＆クラス）
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-text)',
            color: 'var(--color-white)',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            opacity: '0',
            visibility: 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease',
            zIndex: '999',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
        });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(btn);
        return btn;
    }
    /**
     * スクロール関連のイベント（ヘッダー制御＆トップへ戻るボタン）
     */
    initScrollEvents() {
        const scrollThreshold = 200; // トップへ戻るボタンを表示するスクロール量
        // ヘッダー制御用のスタイル追加
        if (this.header) {
            this.header.style.transition = 'transform 0.3s ease';
            this.header.style.position = 'sticky';
            this.header.style.top = '0';
            this.header.style.zIndex = '1000';
        }
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            // 1. トップへ戻るボタンの表示/非表示
            if (currentScrollY > scrollThreshold) {
                this.backToTopBtn.style.opacity = '1';
                this.backToTopBtn.style.visibility = 'visible';
            }
            else {
                this.backToTopBtn.style.opacity = '0';
                this.backToTopBtn.style.visibility = 'hidden';
            }
            // 2. ヘッダーのスクロール連動（下スクロールで隠れ、上スクロールで表示）
            if (this.header) {
                if (currentScrollY > this.lastScrollY && currentScrollY > this.header.offsetHeight) {
                    // 下スクロール
                    this.header.style.transform = 'translateY(-100%)';
                }
                else {
                    // 上スクロール
                    this.header.style.transform = 'translateY(0)';
                }
            }
            this.lastScrollY = currentScrollY;
        }, { passive: true });
    }
    /**
     * 画像やInstagram埋め込みの遅延読み込み（Lazy Load）
     */
    initLazyLoading() {
        // 監視対象要素（遅延読み込み用画像と、Instagramのプレースホルダー）
        const lazyImages = document.querySelectorAll('img[data-src]');
        const lazyEmbeds = document.querySelectorAll('.instagram-embed-placeholder');
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '50px 0px',
                threshold: 0.1
            };
            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.tagName.toLowerCase() === 'img') {
                            // 画像の遅延読み込み
                            const img = element;
                            const src = img.getAttribute('data-src');
                            if (src) {
                                img.src = src;
                                img.removeAttribute('data-src');
                            }
                        }
                        else if (element.classList.contains('instagram-embed-placeholder')) {
                            // 埋め込み要素の遅延読み込み（実際の埋め込みスクリプトを発火させる等の処理）
                            element.style.opacity = '1';
                            element.dataset.loaded = 'true';
                            // 必要に応じてInstagramのembed.jsを実行
                            // window.instgrm?.Embeds.process();
                        }
                        observerInstance.unobserve(element);
                    }
                });
            }, observerOptions);
            lazyImages.forEach(img => observer.observe(img));
            lazyEmbeds.forEach(embed => {
                embed.style.opacity = '0.5'; // ロード前スタイル
                embed.style.transition = 'opacity 0.5s ease';
                observer.observe(embed);
            });
        }
        else {
            // IntersectionObserver非対応ブラウザのフォールバック
            lazyImages.forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
            });
            lazyEmbeds.forEach(embed => {
                embed.style.opacity = '1';
            });
        }
    }
}
// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    new CommonFeatures();
});
/**============================================================================================================-===-
 * index.ts
 * ラグビーナビ ホームページ（トップページ）専用の機能
 */
class HomePageFeatures {
    constructor() {
        this.initSlider();
        this.initFadeInOnScroll();
    }
    /**
     * 必須機能：記事セクション（TOPIC!）のスライダー（カルーセル）移動機能
     */
    initSlider() {
        // スライダーの各要素を取得
        const prevBtn = document.querySelector('.slider-controls .slider-arrow:first-child');
        const nextBtn = document.querySelector('.slider-controls .slider-arrow:last-child');
        const pageIndicator = document.querySelector('.slider-page');
        const articleGrid = document.querySelector('.article-grid');
        if (!prevBtn || !nextBtn || !pageIndicator || !articleGrid)
            return;
        let currentPage = 1;
        const totalPages = 2; // ※実際は記事数から動的計算しますが、今回はHTMLの「01 / 02」に合わせます。
        // スムーズなアニメーションのためのCSS適用
        articleGrid.style.transition = 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out';
        // スライダーの状態を更新する関数
        const updateSlider = () => {
            // 1. ページ番号表示の更新
            pageIndicator.textContent = `0${currentPage} / 0${totalPages}`;
            // 2. スライド（フェード＆移動）のアニメーション実行
            // ※HTMLの構造上（隣にasideがあるため）、強引なX軸移動ではなくフェードと微小なY軸移動で
            //   「ページが切り替わった感」をスマートに演出するモック処理とします。
            //   （実際のデータフェッチやDOM差し替え時にも相性が良いUXです）
            articleGrid.style.opacity = '0';
            articleGrid.style.transform = 'translateY(10px)';
            setTimeout(() => {
                // ここで本来は次ページのDOMデータ差し替え等を行います
                articleGrid.style.opacity = '1';
                articleGrid.style.transform = 'translateY(0)';
            }, 400); // transitionの時間と合わせる
            // 3. 矢印ボタンの非活性（UI無効化）制御
            if (currentPage === 1) {
                prevBtn.style.opacity = '0.3';
                prevBtn.style.pointerEvents = 'none';
            }
            else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }
            if (currentPage === totalPages) {
                nextBtn.style.opacity = '0.3';
                nextBtn.style.pointerEvents = 'none';
            }
            else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        };
        // イベントリスナーの登録
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateSlider();
            }
        });
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateSlider();
            }
        });
        // 初期状態のセット
        updateSlider();
    }
    /**
     * 追加機能：各セクションがスクロールで画面に入った際の下からのフェードイン表示
     */
    initFadeInOnScroll() {
        // アニメーション対象の主要セクションを取得
        const fadeElements = document.querySelectorAll('.hero-visual, .main-nav, .topic-section, .player-section, .editor-section, .contact-section');
        // 初期スタイルを設定（下方にずらして透明に）
        fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        });
        // IntersectionObserverの設定
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // 画面下部から100px入った所で発火させる
            threshold: 0.1
        };
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    // 表示エリアに入ったらスタイルを元に戻す（フェードイン）
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    // 一度表示されたら監視を解除して負荷を減らす
                    observerInstance.unobserve(element);
                }
            });
        }, observerOptions);
        // 監視の開始
        fadeElements.forEach(el => observer.observe(el));
    }
}
// DOMの読み込みが完了したらインスタンス化して実行
document.addEventListener('DOMContentLoaded', () => {
    new HomePageFeatures();
});
/**=======================================================================================================
 * rules.ts
 * ラグビールール一覧ページ専用の機能
 */
class RulesPageFeatures {
    constructor() {
        this.initTocHighlight();
        this.initAccordionForMobile();
        this.initTocToggle();
    }
    /**
     * 追加機能：スクロール位置に応じた目次（TOC）の現在地ハイライト
     */
    initTocHighlight() {
        const sections = document.querySelectorAll('.article-section');
        const tocLinks = document.querySelectorAll('.toc-list a');
        if (sections.length === 0 || tocLinks.length === 0)
            return;
        // スクロール時に発火するObserverの設定
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // 画面上部20%〜30%の範囲にセクションがある場合にアクティブとする
            threshold: 0
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    // 全てのTOCリンクからハイライトを外す
                    tocLinks.forEach(link => {
                        link.style.color = 'var(--color-text)';
                        link.style.fontWeight = '400';
                        link.style.textDecoration = 'none';
                    });
                    // 現在見えているセクションのTOCリンクをハイライト（ラグビーナビのアクセントカラー等を使用）
                    const activeLink = document.querySelector(`.toc-list a[href="#${currentId}"]`);
                    if (activeLink) {
                        activeLink.style.color = 'var(--color-accent)'; // 例: #E53935
                        activeLink.style.fontWeight = '700';
                        activeLink.style.textDecoration = 'underline';
                    }
                }
            });
        }, observerOptions);
        sections.forEach(section => {
            if (section.getAttribute('id')) {
                observer.observe(section);
            }
        });
    }
    /**
     * 追加機能：目次自体の開閉（[閉じる] / [開く]）トグル機能
     */
    initTocToggle() {
        const tocTitleBox = document.querySelector('.toc-title');
        const tocToggleBtn = document.querySelector('.toc-title span');
        const tocList = document.querySelector('.toc-list');
        if (!tocTitleBox || !tocToggleBtn || !tocList)
            return;
        // 初期状態のためのスタイル設定
        tocList.style.transition = 'max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease';
        tocList.style.overflow = 'hidden';
        // 現在の高さを取得してインラインスタイルとして設定（アニメーション用）
        const initialHeight = tocList.scrollHeight + 'px';
        tocList.style.maxHeight = initialHeight;
        tocList.style.opacity = '1';
        let isOpen = true;
        tocToggleBtn.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                tocList.style.maxHeight = tocList.scrollHeight + 'px';
                tocList.style.opacity = '1';
                tocList.style.marginTop = '15px';
                tocToggleBtn.textContent = '[閉じる]';
            }
            else {
                tocList.style.maxHeight = '0px';
                tocList.style.opacity = '0';
                tocList.style.marginTop = '0';
                tocToggleBtn.textContent = '[開く]';
            }
        });
    }
    /**
     * 追加機能：複雑なルールや表をスマホで見やすくするためのアコーディオン（開閉）機能
     * 対象：.data-table (危険なプレーの表など)
     */
    initAccordionForMobile() {
        const tables = document.querySelectorAll('.data-table');
        // モバイル幅（例: 768px以下）の場合のみアコーディオンを適用
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile || tables.length === 0)
            return;
        tables.forEach((table, index) => {
            // テーブルをラップするコンテナを作成
            const wrapper = document.createElement('div');
            wrapper.className = 'table-accordion-wrapper';
            wrapper.style.marginBottom = '30px';
            // アコーディオンのトグルボタンを作成
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'table-toggle-btn';
            toggleBtn.innerHTML = '詳細データ表を見る ▼';
            Object.assign(toggleBtn.style, {
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                marginBottom: '10px',
                transition: 'background-color 0.2s ease'
            });
            // テーブル本体を隠すためのコンテナ
            const contentContainer = document.createElement('div');
            Object.assign(contentContainer.style, {
                maxHeight: '0',
                overflow: 'hidden',
                transition: 'max-height 0.4s ease, opacity 0.4s ease',
                opacity: '0'
            });
            // DOMツリーの再構築（tableの前にwrapperを挿入し、tableを移動）
            if (table.parentNode) {
                table.parentNode.insertBefore(wrapper, table);
                contentContainer.appendChild(table);
                wrapper.appendChild(toggleBtn);
                wrapper.appendChild(contentContainer);
                // tableのもともとのマージンをリセット
                table.style.margin = '0';
            }
            // 開閉イベントの登録
            let isTableOpen = false;
            toggleBtn.addEventListener('click', () => {
                isTableOpen = !isTableOpen;
                if (isTableOpen) {
                    contentContainer.style.maxHeight = contentContainer.scrollHeight + 'px';
                    contentContainer.style.opacity = '1';
                    toggleBtn.innerHTML = '詳細データ表を閉じる ▲';
                    toggleBtn.style.backgroundColor = 'var(--color-white)';
                }
                else {
                    contentContainer.style.maxHeight = '0';
                    contentContainer.style.opacity = '0';
                    toggleBtn.innerHTML = '詳細データ表を見る ▼';
                    toggleBtn.style.backgroundColor = 'var(--color-bg)';
                }
            });
        });
    }
}
// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    new RulesPageFeatures();
});
/**===============================~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~
 * ai-analysis.ts
 * AI解説ページ専用の機能
 */
class AiAnalysisFeatures {
    urlInput;
    urlBtn;
    fileInput;
    uploadArea;
    resultSection;
    resultPlaceholder;
    constructor() {
        this.urlInput = document.getElementById('video-url');
        this.urlBtn = document.querySelector('.url-input-wrapper .ai-btn-primary');
        this.fileInput = document.getElementById('file-upload');
        this.uploadArea = document.querySelector('.upload-area');
        this.resultSection = document.querySelector('.ai-result-section');
        this.resultPlaceholder = document.querySelector('.result-placeholder');
        this.init();
    }
    init() {
        this.initUrlAnalysis();
        this.initFileUpload();
        this.initDragAndDrop();
    }
    /**
     * 追加機能：URLの簡易バリデーションと解析処理のトリガー
     */
    initUrlAnalysis() {
        if (!this.urlBtn || !this.urlInput)
            return;
        this.urlBtn.addEventListener('click', () => {
            const url = this.urlInput.value.trim();
            // 簡易バリデーション (http:// または https:// で始まるか)
            const isValidUrl = /^https?:\/\//.test(url);
            if (!url) {
                alert('動画のURLを入力してください。');
                return;
            }
            if (!isValidUrl) {
                alert('有効なURL（http:// または https:// から始まる文字列）を入力してください。');
                return;
            }
            // バリデーション通過後、解析モック処理を開始
            this.startMockAnalysis('URL: ' + url);
        });
    }
    /**
     * 必須機能：写真フォルダ等からの動画ファイル選択機能
     */
    initFileUpload() {
        if (!this.fileInput)
            return;
        this.fileInput.addEventListener('change', (e) => {
            const target = e.target;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                this.handleFile(file);
            }
        });
    }
    /**
     * 追加機能：ドラッグ＆ドロップでのファイルアップロードUI
     */
    initDragAndDrop() {
        if (!this.uploadArea)
            return;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        // ホバー時のUIフィードバック
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.style.borderColor = 'var(--color-text)';
                this.uploadArea.style.backgroundColor = 'var(--color-white)';
            }, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.style.borderColor = 'var(--color-border)';
                this.uploadArea.style.backgroundColor = 'var(--color-bg)';
            }, false);
        });
        // ドロップ時の処理
        this.uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                const file = dt.files[0];
                // input type="file" にドロップされたファイルをセット
                if (this.fileInput) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    this.fileInput.files = dataTransfer.files;
                }
                this.handleFile(file);
            }
        }, false);
    }
    /**
     * ファイル処理の共通ロジック
     */
    handleFile(file) {
        // 簡易なファイルチェック (動画ファイルか、サイズは適切か等)
        if (!file.type.startsWith('video/')) {
            alert('動画ファイル（MP4, MOV等）を選択してください。');
            // inputリセット
            if (this.fileInput)
                this.fileInput.value = '';
            return;
        }
        // サイズチェック (例: 50MB = 50 * 1024 * 1024 bytes)
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('ファイルサイズが大きすぎます。50MB以下のファイルを選択してください。');
            if (this.fileInput)
                this.fileInput.value = '';
            return;
        }
        this.startMockAnalysis('ファイル: ' + file.name);
    }
    /**
     * 追加機能：解析ボタン押下時のローディングアニメーション（モック処理）
     */
    startMockAnalysis(sourceName) {
        if (!this.resultPlaceholder)
            return;
        // 現在の位置までスクロール
        this.resultSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // 1. ローディングUIの構築（プログレスバー追加）
        this.resultPlaceholder.innerHTML = `
      <div class="spinner"></div>
      <p style="font-weight:700;">AIが動画を解析中です... (<span id="progress-text">0</span>%)</p>
      <p style="font-size: 0.85rem; color: var(--color-text-light);">${sourceName}</p>
      <div style="width: 100%; max-width: 400px; height: 6px; background-color: var(--color-border); border-radius: 3px; margin-top: 15px; overflow: hidden;">
        <div id="progress-bar" style="width: 0%; height: 100%; background-color: var(--color-text); transition: width 0.3s ease;"></div>
      </div>
    `;
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        let progress = 0;
        // 2. プログレスバーを進めるタイマー処理
        const intervalId = setInterval(() => {
            // 乱数で進捗をばらつかせる
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(intervalId);
                // 100%になったら少し待ってから結果画面を表示
                setTimeout(() => this.showAnalysisResult(), 500);
            }
            if (progressBar)
                progressBar.style.width = `${progress}%`;
            if (progressText)
                progressText.textContent = progress.toString();
        }, 300);
    }
    /**
     * 解析完了後の結果表示UI構築（モック）
     */
    showAnalysisResult() {
        if (!this.resultPlaceholder)
            return;
        // 解析結果のダミーDOMを生成（今回は静的な文字列でモック）
        this.resultPlaceholder.style.backgroundColor = 'var(--color-white)';
        this.resultPlaceholder.style.padding = '40px';
        this.resultPlaceholder.innerHTML = `
      <div style="text-align:left; width: 100%;">
        <h3 style="font-size: 1.3rem; margin-bottom: 20px; border-bottom: 2px solid var(--color-text); padding-bottom: 10px;">✅ 解析が完了しました</h3>
        
        <div style="display:flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex:1; min-width: 280px;">
            <div style="background-color: var(--color-bg); aspect-ratio: 16/9; display:flex; align-items:center; justify-content:center; border-radius: 8px; margin-bottom: 15px;">
              <span style="color: var(--color-text-light);">[図解生成モック用画像領域]</span>
            </div>
          </div>
          <div style="flex:1; min-width: 280px;">
            <h4 style="font-size: 1.1rem; margin-bottom: 10px;">AIの解説ポイント：</h4>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px; padding-left: 1.5em; position: relative;">
                <span style="position: absolute; left: 0; top: 0;">🏉</span>
                <strong style="color: var(--color-accent);">オフサイドの可能性</strong><br>
                ラック形成時、青ジャージの選手がオフサイドライン（最後尾の選手の足元）より前に位置しているとAIが判定しました。
              </li>
              <li style="margin-bottom: 10px; padding-left: 1.5em; position: relative;">
                <span style="position: absolute; left: 0; top: 0;">🏉</span>
                <strong>素晴らしいジャッカル</strong><br>
                タックル成立後、赤ジャージの選手が素早くボールに絡み（ノット・リリース・ザ・ボール誘発）、完璧なタイミングでのジャッカルを成功させています。
              </li>
            </ul>
          </div>
        </div>
        <div style="text-align:center; margin-top: 30px;">
           <button class="ai-btn-secondary" onclick="location.reload()">別の動画を解析する</button>
        </div>
      </div>
    `;
    }
}
// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    new AiAnalysisFeatures();
});
/**^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * best15-teams.ts
 * チーム解説＆ベスト15ページ群共通の機能
 */
class Best15AndTeamsFeatures {
    modalOverlay = null;
    modalContent = null;
    modalBody = null;
    constructor() {
        this.createModal();
        this.initModalEvents();
    }
    /**
     * 追加機能：モーダル（ポップアップ）ウィンドウのDOMを動的に生成
     */
    createModal() {
        // 既に存在する場合はスキップ
        if (document.getElementById('custom-modal-overlay'))
            return;
        // オーバーレイ（背景）
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.id = 'custom-modal-overlay';
        Object.assign(this.modalOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: '2000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0',
            visibility: 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease'
        });
        // モーダルコンテンツ枠
        this.modalContent = document.createElement('div');
        Object.assign(this.modalContent.style, {
            backgroundColor: 'var(--color-white, #fff)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '8px',
            padding: '30px',
            position: 'relative',
            transform: 'translateY(20px)',
            transition: 'transform 0.3s ease',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        });
        // 閉じるボタン (×)
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', '閉じる');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: 'var(--color-text-light, #666)'
        });
        closeBtn.addEventListener('click', () => this.closeModal());
        // 中身を注入するコンテナ
        this.modalBody = document.createElement('div');
        this.modalContent.appendChild(closeBtn);
        this.modalContent.appendChild(this.modalBody);
        this.modalOverlay.appendChild(this.modalContent);
        document.body.appendChild(this.modalOverlay);
        // 背景クリックで閉じる機能
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
    }
    /**
     * モーダルを開く処理
     */
    openModal(htmlContent) {
        if (!this.modalOverlay || !this.modalContent || !this.modalBody)
            return;
        // コンテンツをセットして表示
        this.modalBody.innerHTML = htmlContent;
        this.modalOverlay.style.visibility = 'visible';
        this.modalOverlay.style.opacity = '1';
        this.modalContent.style.transform = 'translateY(0)';
        document.body.style.overflow = 'hidden'; // 背景スクロール防止
    }
    /**
     * 追加機能：モーダルを閉じる処理
     */
    closeModal() {
        if (!this.modalOverlay || !this.modalContent)
            return;
        this.modalOverlay.style.opacity = '0';
        this.modalContent.style.transform = 'translateY(20px)';
        // アニメーション完了後に非表示
        setTimeout(() => {
            this.modalOverlay.style.visibility = 'hidden';
            if (this.modalBody)
                this.modalBody.innerHTML = '';
            document.body.style.overflow = ''; // 背景スクロール復帰
        }, 300);
    }
    /**
     * 選手ノードやチームカードのクリックイベントを紐付け
     */
    initModalEvents() {
        // 1. ポジション図の選手アイコン (.player-node)
        const playerNodes = document.querySelectorAll('.player-node');
        playerNodes.forEach(node => {
            node.style.cursor = 'pointer';
            node.addEventListener('click', () => {
                const playerName = node.querySelector('.node-name')?.textContent || '';
                if (!playerName)
                    return;
                // ページ内の .player-profile-card から名前が一致するものを探す
                const profileCards = document.querySelectorAll('.player-profile-card');
                let targetHTML = '';
                profileCards.forEach(card => {
                    const cardName = card.querySelector('h3')?.textContent || '';
                    if (cardName.includes(playerName)) {
                        // 見つかったカードのHTMLをコピーしてモーダルに渡す
                        targetHTML = card.outerHTML;
                    }
                });
                if (targetHTML) {
                    this.openModal(targetHTML);
                }
                else {
                    // 詳細が見つからない場合のフォールバック
                    this.openModal(`<div style="text-align:center; padding:20px;"><strong>${playerName}</strong> の詳細データは現在準備中です。</div>`);
                }
            });
        });
        // 2. チーム一覧のカード (.team-card)
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            // チームカード自体をクリッカブル風に（CSSでhoverエフェクトを追加しても良い）
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-3px)';
                card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.05)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
            });
            card.addEventListener('click', () => {
                // カードのHTMLをそのままモーダルに表示
                // ※モーダル内でスタイルが崩れないように必要に応じてラッパーで囲む
                this.openModal(`<div class="modal-team-wrapper">${card.innerHTML}</div>`);
            });
        });
    }
}
// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    new Best15AndTeamsFeatures();
});
/**^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * article.ts
 * 記事セクション共通の機能（ニュース、コラム、レポート等）
 */
class ArticleFeatures {
    progressBar = null;
    articleContainer = null;
    constructor() {
        this.articleContainer = document.querySelector('.article-container');
        if (this.articleContainer) {
            this.initProgressBar();
            this.initShareButtons();
        }
    }
    /**
     * 追加機能：記事の読了率を示す、画面上部のスクロール連動プログレスバー
     */
    initProgressBar() {
        // プログレスバーのコンテナ生成
        const progressContainer = document.createElement('div');
        Object.assign(progressContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '4px',
            backgroundColor: 'transparent',
            zIndex: '2000'
        });
        // 伸びるバーの部分
        this.progressBar = document.createElement('div');
        Object.assign(this.progressBar.style, {
            height: '100%',
            width: '0%',
            backgroundColor: 'var(--color-accent, #E53935)',
            transition: 'width 0.1s ease-out'
        });
        progressContainer.appendChild(this.progressBar);
        document.body.appendChild(progressContainer);
        // スクロールイベントで幅を更新
        window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
        // 初期化時にも一度実行
        this.updateProgress();
    }
    updateProgress() {
        if (!this.progressBar)
            return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight <= 0) {
            this.progressBar.style.width = '0%';
            return;
        }
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        this.progressBar.style.width = `${scrollPercentage}%`;
    }
    /**
     * 追加機能：SNSシェアボタン群の動的生成とシェアポップアップ展開
     */
    initShareButtons() {
        // 記事末尾（.article-body の最後など）にシェアエリアを追加
        const articleBody = document.querySelector('.article-body');
        if (!articleBody)
            return;
        const shareContainer = document.createElement('div');
        shareContainer.className = 'article-share-container';
        Object.assign(shareContainer.style, {
            marginTop: '50px',
            paddingTop: '20px',
            borderTop: '1px dashed var(--color-border)',
            textAlign: 'center'
        });
        shareContainer.innerHTML = `
      <p style="font-weight: 700; margin-bottom: 15px; font-size: 0.95rem;">この記事をシェアする</p>
      <div style="display: flex; justify-content: center; gap: 15px;">
        <button class="share-btn share-x" data-platform="x" style="background-color: #000; color: #fff; padding: 10px 20px; border-radius: 30px; border: none; font-weight: 700; cursor: pointer;">X (Twitter)</button>
        <button class="share-btn share-fb" data-platform="facebook" style="background-color: #1877F2; color: #fff; padding: 10px 20px; border-radius: 30px; border: none; font-weight: 700; cursor: pointer;">Facebook</button>
        <button class="share-btn share-line" data-platform="line" style="background-color: #06C755; color: #fff; padding: 10px 20px; border-radius: 30px; border: none; font-weight: 700; cursor: pointer;">LINE</button>
      </div>
    `;
        articleBody.appendChild(shareContainer);
        // シェアボタンのクリックイベント
        const shareBtns = shareContainer.querySelectorAll('.share-btn');
        shareBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.getAttribute('data-platform');
                this.openShareWindow(platform);
            });
        });
    }
    openShareWindow(platform) {
        if (!platform)
            return;
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        let shareUrl = '';
        switch (platform) {
            case 'x':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'line':
                shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
                break;
            default:
                return;
        }
        // 新しいウィンドウ（ポップアップ）で開く
        window.open(shareUrl, 'share_window', 'width=600,height=500,location=no,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes');
    }
}
// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    new ArticleFeatures();
});
/**^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * players.ts
 * 選手名鑑ページ群（高校、大学、リーグワン）専用の機能
 */
class PlayerDirectoryFeatures {
    articleBody;
    sections;
    playerCards;
    constructor() {
        this.articleBody = document.querySelector('.article-body');
        this.sections = document.querySelectorAll('.article-section');
        this.playerCards = document.querySelectorAll('.player-profile-card');
        if (this.articleBody && this.playerCards.length > 0) {
            this.initSearchAndFilterUI();
            this.initInstagramLazyLoad();
        }
    }
    /**
     * 追加機能：検索＆フィルター用UIの動的生成とイベント制御
     */
    initSearchAndFilterUI() {
        // 検索・フィルターエリアのコンテナ
        const toolBar = document.createElement('div');
        Object.assign(toolBar.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            backgroundColor: 'var(--color-bg)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            border: '1px solid var(--color-border)'
        });
        // メディアクエリ風にPCでは横並びに
        if (window.innerWidth > 600) {
            toolBar.style.flexDirection = 'row';
            toolBar.style.alignItems = 'center';
        }
        // 1. テキスト検索（インクリメンタルサーチ）用インプット
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '選手名で検索 (漢字・ひらがな)';
        Object.assign(searchInput.style, {
            flex: '1',
            padding: '12px 15px',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: '1rem',
            outline: 'none'
        });
        searchInput.addEventListener('focus', () => searchInput.style.borderColor = 'var(--color-text)');
        searchInput.addEventListener('blur', () => searchInput.style.borderColor = 'var(--color-border)');
        // 2. チーム/大学フィルター用セレクトボックス
        const filterSelect = document.createElement('select');
        Object.assign(filterSelect.style, {
            flex: '1',
            padding: '12px 15px',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: '1rem',
            outline: 'none',
            backgroundColor: '#fff',
            cursor: 'pointer'
        });
        // セクション(チーム/大学)からoptionを動的生成
        const defaultOption = document.createElement('option');
        defaultOption.value = 'all';
        defaultOption.textContent = 'すべてのチーム・大学';
        filterSelect.appendChild(defaultOption);
        this.sections.forEach(section => {
            const sectionTitle = section.querySelector('h2');
            if (sectionTitle && section.id) {
                const option = document.createElement('option');
                option.value = section.id;
                option.textContent = sectionTitle.textContent;
                filterSelect.appendChild(option);
            }
        });
        toolBar.appendChild(searchInput);
        toolBar.appendChild(filterSelect);
        // articleBodyの先頭に挿入
        this.articleBody.insertBefore(toolBar, this.articleBody.firstChild);
        // 検索＆フィルターのロジック実行関数
        const filterPlayers = () => {
            const keyword = searchInput.value.toLowerCase().trim();
            const selectedTarget = filterSelect.value;
            this.sections.forEach(section => {
                let hasVisibleCard = false;
                // セクション自体の表示可否（フィルター判定）
                const isSectionMatch = selectedTarget === 'all' || section.id === selectedTarget;
                const cards = section.querySelectorAll('.player-profile-card');
                cards.forEach(card => {
                    const playerName = card.querySelector('h3')?.textContent?.toLowerCase() || '';
                    // 名前検索判定 ＆ セクション判定
                    if (playerName.includes(keyword) && isSectionMatch) {
                        card.style.display = 'block';
                        hasVisibleCard = true;
                    }
                    else {
                        card.style.display = 'none';
                    }
                });
                // 該当する選手がいないセクションは非表示にする（見出しだけ残るのを防ぐ）
                // ※「まとめ」などの h2 しかないセクションは消さないようにする対策
                if (cards.length > 0) {
                    section.style.display = hasVisibleCard ? 'block' : 'none';
                }
                else {
                    section.style.display = isSectionMatch ? 'block' : 'none';
                }
            });
        };
        // イベントのバインド (inputイベントでリアルタイム反映)
        searchInput.addEventListener('input', filterPlayers);
        filterSelect.addEventListener('change', filterPlayers);
    }
    /**
     * 追加機能：Instagram埋め込みの最適化（IntersectionObserverによるLazy Load）
     */
    initInstagramLazyLoad() {
        const embedPlaceholders = document.querySelectorAll('.instagram-embed-placeholder');
        if (embedPlaceholders.length === 0 || !('IntersectionObserver' in window))
            return;
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const placeholder = entry.target;
                    // ここで本来はInstagramのiframeやblockquoteを動的に生成して注入します
                    // 今回はモック処理としてローディング状態から完了状態へのUI遷移を実装
                    placeholder.innerHTML = '<div class="spinner" style="border-color: #ccc; border-top-color: #E53935; width:30px; height:30px;"></div>';
                    setTimeout(() => {
                        // ダミーの画像やスタイルに変更して「読み込み完了」を演出
                        placeholder.style.backgroundColor = '#eaeaea';
                        placeholder.style.border = 'none';
                        placeholder.innerHTML = `
              <div style="text-align:center;">
                <span style="font-size: 2rem;">📸</span><br>
                <span style="font-size: 0.8rem; color: #666;">Instagram Content Loaded</span>
              </div>
            `;
                        // 本来は window.instgrm.Embeds.process() などを呼び出す
                    }, 800 + Math.random() * 500);
                    // 一度読み込んだら監視を解除
                    obs.unobserve(placeholder);
                }
            });
        }, {
            rootMargin: '200px 0px', // 画面に入る200px手前でロード開始
            threshold: 0
        });
        embedPlaceholders.forEach(el => observer.observe(el));
    }
}
// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    new PlayerDirectoryFeatures();
});
export {};
//# sourceMappingURL=app.js.map