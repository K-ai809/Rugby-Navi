// app.ts
const message: string = "TypeScriptの準備";
console.log(message);


/**
 * common.ts
 * ラグビーナビ 全ページ共通の機能
 */

class CommonFeatures {
  private header: HTMLElement | null;
  private backToTopBtn: HTMLButtonElement;
  private lastScrollY: number;

  constructor() {
    this.header = document.querySelector('.site-header');
    this.lastScrollY = window.scrollY;
    this.backToTopBtn = this.createBackToTopButton();

    this.init();
  }

  private init(): void {
    this.initSmoothScroll();
    this.initScrollEvents();
    this.initLazyLoading();
  }

  /**
   * スムーススクロール（アンカーリンク押下時）
   */
  private initSmoothScroll(): void {
    const anchorLinks = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector<HTMLElement>(targetId);
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
  private createBackToTopButton(): HTMLButtonElement {
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
  private initScrollEvents(): void {
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
      } else {
        this.backToTopBtn.style.opacity = '0';
        this.backToTopBtn.style.visibility = 'hidden';
      }

      // 2. ヘッダーのスクロール連動（下スクロールで隠れ、上スクロールで表示）
      if (this.header) {
        if (currentScrollY > this.lastScrollY && currentScrollY > this.header.offsetHeight) {
          // 下スクロール
          this.header.style.transform = 'translateY(-100%)';
        } else {
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
  private initLazyLoading(): void {
    // 監視対象要素（遅延読み込み用画像と、Instagramのプレースホルダー）
    const lazyImages = document.querySelectorAll<HTMLImageElement>('img[data-src]');
    const lazyEmbeds = document.querySelectorAll<HTMLElement>('.instagram-embed-placeholder');

    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '50px 0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;

            if (element.tagName.toLowerCase() === 'img') {
              // 画像の遅延読み込み
              const img = element as HTMLImageElement;
              const src = img.getAttribute('data-src');
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
              }
            } else if (element.classList.contains('instagram-embed-placeholder')) {
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
    } else {
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
  private initSlider(): void {
    // スライダーの各要素を取得
    const prevBtn = document.querySelector<HTMLButtonElement>('.slider-controls .slider-arrow:first-child');
    const nextBtn = document.querySelector<HTMLButtonElement>('.slider-controls .slider-arrow:last-child');
    const pageIndicator = document.querySelector<HTMLSpanElement>('.slider-page');
    const articleGrid = document.querySelector<HTMLElement>('.article-grid');
    
    if (!prevBtn || !nextBtn || !pageIndicator || !articleGrid) return;

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
      } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
      }

      if (currentPage === totalPages) {
        nextBtn.style.opacity = '0.3';
        nextBtn.style.pointerEvents = 'none';
      } else {
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
  private initFadeInOnScroll(): void {
    // アニメーション対象の主要セクションを取得
    const fadeElements = document.querySelectorAll<HTMLElement>(
      '.hero-visual, .main-nav, .topic-section, .player-section, .editor-section, .contact-section'
    );

    // 初期スタイルを設定（下方にずらして透明に）
    fadeElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    });

    // IntersectionObserverの設定
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // 画面下部から100px入った所で発火させる
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          
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
  private initTocHighlight(): void {
    const sections = document.querySelectorAll<HTMLElement>('.article-section');
    const tocLinks = document.querySelectorAll<HTMLAnchorElement>('.toc-list a');

    if (sections.length === 0 || tocLinks.length === 0) return;

    // スクロール時に発火するObserverの設定
    const observerOptions: IntersectionObserverInit = {
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
          const activeLink = document.querySelector<HTMLAnchorElement>(`.toc-list a[href="#${currentId}"]`);
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
  private initTocToggle(): void {
    const tocTitleBox = document.querySelector<HTMLElement>('.toc-title');
    const tocToggleBtn = document.querySelector<HTMLElement>('.toc-title span');
    const tocList = document.querySelector<HTMLUListElement>('.toc-list');

    if (!tocTitleBox || !tocToggleBtn || !tocList) return;

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
      } else {
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
  private initAccordionForMobile(): void {
    const tables = document.querySelectorAll<HTMLTableElement>('.data-table');
    
    // モバイル幅（例: 768px以下）の場合のみアコーディオンを適用
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile || tables.length === 0) return;

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
        maxHeight : '0',
        overflow : 'hidden',
        transition : 'max-height 0.4s ease, opacity 0.4s ease',
        opacity : '0'
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
        } else {
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



// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
  new AiAnalysisFeatures();
});

/**^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * best15-teams.ts
 * チーム解説＆ベスト15ページ群共通の機能
 */

class Best15AndTeamsFeatures {
  private modalOverlay: HTMLDivElement | null = null;
  private modalContent: HTMLDivElement | null = null;
  private modalBody: HTMLDivElement | null = null;

  constructor() {
    this.createModal();
    this.initModalEvents();
  }

  /**
   * 追加機能：モーダル（ポップアップ）ウィンドウのDOMを動的に生成
   */
  private createModal(): void {
    // 既に存在する場合はスキップ
    if (document.getElementById('custom-modal-overlay')) return;

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
  private openModal(htmlContent: string): void {
    if (!this.modalOverlay || !this.modalContent || !this.modalBody) return;
    
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
  private closeModal(): void {
    if (!this.modalOverlay || !this.modalContent) return;

    this.modalOverlay.style.opacity = '0';
    this.modalContent.style.transform = 'translateY(20px)';
    
    // アニメーション完了後に非表示
    setTimeout(() => {
      this.modalOverlay!.style.visibility = 'hidden';
      if (this.modalBody) this.modalBody.innerHTML = '';
      document.body.style.overflow = ''; // 背景スクロール復帰
    }, 300);
  }

  /**
   * 選手ノードやチームカードのクリックイベントを紐付け
   */
  private initModalEvents(): void {
    // 1. ポジション図の選手アイコン (.player-node)
    const playerNodes = document.querySelectorAll<HTMLElement>('.player-node');
    playerNodes.forEach(node => {
      node.style.cursor = 'pointer';
      node.addEventListener('click', () => {
        const playerName = node.querySelector('.node-name')?.textContent || '';
        if (!playerName) return;

        // ページ内の .player-profile-card から名前が一致するものを探す
        const profileCards = document.querySelectorAll<HTMLElement>('.player-profile-card');
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
        } else {
          // 詳細が見つからない場合のフォールバック
          this.openModal(`<div style="text-align:center; padding:20px;"><strong>${playerName}</strong> の詳細データは現在準備中です。</div>`);
        }
      });
    });

    // 2. チーム一覧のカード (.team-card)
    const teamCards = document.querySelectorAll<HTMLElement>('.team-card');
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
  private progressBar: HTMLDivElement | null = null;
  private articleContainer: HTMLElement | null = null;

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
  private initProgressBar(): void {
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

  private updateProgress(): void {
    if (!this.progressBar) return;
    
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
  private initShareButtons(): void {
    // 記事末尾（.article-body の最後など）にシェアエリアを追加
    const articleBody = document.querySelector('.article-body');
    if (!articleBody) return;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'article-share-container';
    Object.assign(shareContainer.style, {
      marginTop : '50px',
      paddingTop :'20px',
      borderTop : '1px dashed var(--color-border)',
      textAlign : 'center'
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
    const shareBtns = shareContainer.querySelectorAll<HTMLButtonElement>('.share-btn');
    shareBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.getAttribute('data-platform');
        this.openShareWindow(platform);
      });
    });
  }

  private openShareWindow(platform: string | null): void {
    if (!platform) return;

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
    window.open(
      shareUrl,
      'share_window',
      'width=600,height=500,location=no,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes'
    );
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
  private articleBody: HTMLElement | null;
  private sections: NodeListOf<HTMLElement>;
  private playerCards: NodeListOf<HTMLElement>;

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
  private initSearchAndFilterUI(): void {
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
    this.articleBody!.insertBefore(toolBar, this.articleBody!.firstChild);

    // 検索＆フィルターのロジック実行関数
    const filterPlayers = () => {
      const keyword = searchInput.value.toLowerCase().trim();
      const selectedTarget = filterSelect.value;

      this.sections.forEach(section => {
        let hasVisibleCard = false;
        
        // セクション自体の表示可否（フィルター判定）
        const isSectionMatch = selectedTarget === 'all' || section.id === selectedTarget;

        const cards = section.querySelectorAll<HTMLElement>('.player-profile-card');
        cards.forEach(card => {
          const playerName = card.querySelector('h3')?.textContent?.toLowerCase() || '';
          
          // 名前検索判定 ＆ セクション判定
          if (playerName.includes(keyword) && isSectionMatch) {
            card.style.display = 'block';
            hasVisibleCard = true;
          } else {
            card.style.display = 'none';
          }
        });

        // 該当する選手がいないセクションは非表示にする（見出しだけ残るのを防ぐ）
        // ※「まとめ」などの h2 しかないセクションは消さないようにする対策
        if (cards.length > 0) {
          section.style.display = hasVisibleCard ? 'block' : 'none';
        } else {
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
  private initInstagramLazyLoad(): void {
    const embedPlaceholders = document.querySelectorAll<HTMLElement>('.instagram-embed-placeholder');
    if (embedPlaceholders.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const placeholder = entry.target as HTMLElement;
          
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function checkApiConnection() {
    try {
        // Javaサーバーの窓口へアクセス
        const response = await fetch('http://localhost:8080/api/test');
        
        // エラーなく通信できたか確認
        if (!response.ok) {
            throw new Error('サーバーとの通信に失敗しました');
        }
        
        // 文字列データとして受け取る
        const data = await response.text();
        console.log('Javaサーバーからの応答:', data);
    } catch (error) {
        console.error('エラー発生:', error);
    }
}

// 画面の読み込みが完了した直後に通信を実行
document.addEventListener('DOMContentLoaded', () => {
    checkApiConnection();
});

/**
 * ------------------------------------------------------------------------
 * AI動画解説ページ用機能（Gemini API連携）
 * ------------------------------------------------------------------------
 */
class AiAnalysisFeatures {
    private fileInput: HTMLInputElement | null;
    private dropArea: HTMLElement | null;
    private resultPlaceholder: HTMLElement | null;
    private resultSection: HTMLElement | null;
  
    constructor() {
      // 以前確実に動いていたidとclassの指定方法に修正
      this.fileInput = document.getElementById('file-upload') as HTMLInputElement | null;
      if (!this.fileInput) this.fileInput = document.querySelector('input[type="file"]');
      
      this.dropArea = document.querySelector('.upload-area');
      this.resultPlaceholder = document.querySelector('.result-placeholder');
      this.resultSection = document.querySelector('.ai-result-section');
  
      // デバッグ用：正しくHTMLを取得できているか裏側で確認
      console.log("AI解析画面の連携チェック:", {
          fileInput: !!this.fileInput,
          dropArea: !!this.dropArea,
          resultPlaceholder: !!this.resultPlaceholder
      });
  
      if (this.fileInput && this.dropArea && this.resultPlaceholder) {
        this.initEventListeners();
      }
    }
  
    private initEventListeners(): void {
      this.fileInput?.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          this.uploadAndAnalyzeVideo(file);
        }
      });
  
      const selectBtn = this.dropArea?.querySelector('button');
      selectBtn?.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.fileInput?.click();
      });
  
      this.dropArea?.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        if (this.dropArea) this.dropArea.style.borderColor = 'var(--color-primary)';
      });
      this.dropArea?.addEventListener('dragleave', (e: DragEvent) => {
        e.preventDefault();
        if (this.dropArea) this.dropArea.style.borderColor = 'var(--color-border)';
      });
      this.dropArea?.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        if (this.dropArea) this.dropArea.style.borderColor = 'var(--color-border)';
        const file = e.dataTransfer?.files?.[0];
        if (file) {
          this.uploadAndAnalyzeVideo(file);
        }
      });
    }
  
    private async uploadAndAnalyzeVideo(file: File): Promise<void> {
      if (!this.resultPlaceholder) return;
  
      if (!file.type.startsWith('video/')) {
        alert('動画ファイル（MP4, MOV等）を選択してください。');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('ファイルサイズは50MB以下にしてください。');
        return;
      }
  
      this.resultSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.resultPlaceholder.innerHTML = `
        <div class="spinner" style="margin: 0 auto; border: 4px solid rgba(0,0,0,0.1); border-left-color: #E53935; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <p style="font-weight:700; margin-top: 15px;">AIが動画を解析中です... しばらくお待ちください。</p>
        <p style="font-size: 0.85rem; color: #666;">${file.name}</p>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;
  
      const formData = new FormData();
      formData.append('videoFile', file);
  
      try {
        const response = await fetch('http://localhost:8080/api/analyze-video', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました');
        }
  
        const data = await response.json();
        this.showRealAnalysisResult(data.result);
  
      } catch (error) {
        console.error(error);
        this.resultPlaceholder.innerHTML = `
          <p style="color: #E53935; font-weight: bold;">解析中にエラーが発生しました。</p>
          <p style="font-size: 0.9rem; color: #666;">（Javaサーバーが起動しているか確認してください）</p>
          <button class="ai-btn-secondary" onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; cursor: pointer;">やり直す</button>
        `;
      }
    }
  
    private showRealAnalysisResult(analysisText: string): void {
      if (!this.resultPlaceholder) return;
  
      this.resultPlaceholder.style.backgroundColor = '#fff';
      this.resultPlaceholder.style.padding = '40px';
      
      const formattedText = analysisText.replace(/\n/g, '<br>');
  
      this.resultPlaceholder.innerHTML = `
        <div style="text-align:left; width: 100%;">
          <h3 style="font-size: 1.3rem; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">✅ AI解析結果</h3>
          <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; border: 1px solid #ddd; line-height: 1.8;">
            ${formattedText}
          </div>
          <div style="text-align:center; margin-top: 30px;">
             <button class="ai-btn-secondary" onclick="location.reload()" style="padding: 10px 20px; cursor: pointer;">別の動画を解析する</button>
          </div>
        </div>
      `;
    }
}

// 起動処理
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.upload-area') || document.getElementById('file-upload')) {
        new AiAnalysisFeatures();
    }
});


/**-----------------------------------------------------------------------------------------------------------------------
 * お問い合わせフォームの送信機能
 */
class ContactFormFeatures {
  private form: HTMLFormElement | null;
  private nameInput: HTMLInputElement | null;
  private emailInput: HTMLInputElement | null;
  private messageInput: HTMLTextAreaElement | null;
  private submitBtn: HTMLButtonElement | null;

  constructor() {
    // スクリーンショットのHTML構造に合わせてDOM要素を取得
    this.form = document.querySelector('.contact-form');
    this.nameInput = document.getElementById('name') as HTMLInputElement | null;
    this.emailInput = document.getElementById('email') as HTMLInputElement | null;
    this.messageInput = document.getElementById('message') as HTMLTextAreaElement | null;
    this.submitBtn = document.querySelector('.submit-btn');

    // フォームが存在するページ（トップページ）のみ処理を実行
    if (this.form) {
      this.initFormSubmit();
    }
  }

  private initFormSubmit(): void {
    this.form!.addEventListener('submit', async (e: Event) => {
      // 画面の再読み込みを防ぐ
      e.preventDefault();

      if (!this.nameInput || !this.emailInput || !this.messageInput || !this.submitBtn) {
        console.error('フォームの必要な要素が見つかりません');
        return;
      }

      // 入力値の取得と前後の空白削除
      const formData = {
        name: this.nameInput.value.trim(),
        email: this.emailInput.value.trim(),
        message: this.messageInput.value.trim()
      };

      // 簡易バリデーション（空チェック）
      if (!formData.name || !formData.email || !formData.message) {
        alert('すべての項目を入力してください。');
        return;
      }

      // 送信中のUI変更（ボタンの連打防止）
      const originalBtnText = this.submitBtn.textContent;
      this.submitBtn.textContent = '送信中...';
      this.submitBtn.disabled = true;
      this.submitBtn.style.opacity = '0.7';
      this.submitBtn.style.cursor = 'not-allowed';

      try {
        // Spring BootのAPIエンドポイントへデータを送信
        // ※バックエンド側（Spring Boot）が http://localhost:8080 で起動している前提です
        const response = await fetch('http://localhost:8080/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました');
        }

        // 送信成功時の処理
        alert('お問い合わせを送信しました。ご連絡ありがとうございます。');
        this.form!.reset(); // フォームの入力内容をクリア

      } catch (error) {
        console.error('送信エラー:', error);
        alert('送信に失敗しました。時間をおいて再度お試しいただくか、バックエンドサーバーが起動しているか確認してください。');
      } finally {
        // 成功・失敗に関わらずボタンのUIを元に戻す
        this.submitBtn.textContent = originalBtnText;
        this.submitBtn.disabled = false;
        this.submitBtn.style.opacity = '1';
        this.submitBtn.style.cursor = 'pointer';
      }
    });
  }
}

// DOM読み込み完了時に機能を初期化
document.addEventListener('DOMContentLoaded', () => {
  new ContactFormFeatures();
});