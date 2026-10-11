// app.ts
const message: string = "TypeScriptの準備";
console.log(message);


// ポジションデータの型定義
interface PositionData {
  name: string;
  players: string;
}

// 選手データの型定義
interface PlayerData {
  name: string;
  position: string;
  description: string;
}

// グローバルスコープ（window）に関数を登録するための型宣言
declare global {
  interface Window {
    checkAnswer: (selectedNumber: number) => void;
    showPlayer: (positionCode: string) => void;
    closeModal: () => void;
    openPlayerModal: (playerId: string) => void;
    closePlayerModal: () => void;
  }
}

/**
 * ==========================================
 * 1. ホーム：スライドショー
 * ==========================================
 */
window.addEventListener('load', () => {
  const slides = document.querySelectorAll<HTMLElement>('.fade');
  if (slides.length === 0) return; // 画像がないページでは何もしない

  let currentIndex = 0;

  // 初期化：すべての画像からactiveを外し、1枚目だけにつける
  slides.forEach((slide) => slide.classList.remove('active'));
  slides[0]?.classList.add('active');

  setInterval(() => {
    slides[currentIndex]?.classList.remove('active');

    currentIndex++;
    if (currentIndex === slides.length) {
      currentIndex = 0;
    }

    slides[currentIndex]?.classList.add('active');
  }, 3000);
});


/**
 * ==========================================
 * 2. 反則、ルールページ：リアルタイム検索
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector<HTMLFormElement>('.search-form');
  const searchBox = document.getElementById('search-box') as HTMLInputElement | null;
  const tableRows = document.querySelectorAll<HTMLTableRowElement>('.table tbody tr');

  if (searchForm) {
    searchForm.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
    });
  }

  if (searchBox) {
    searchBox.addEventListener('input', () => {
      const keyword = searchBox.value.toLowerCase();

      tableRows.forEach((row) => {
        // nullチェックを行いながら安全にテキストを取得
        const ruleNameElement = row.querySelector<HTMLElement>('.name');
        const descElement = row.querySelectorAll<HTMLElement>('td')[1];

        const ruleName = ruleNameElement ? ruleNameElement.textContent?.toLowerCase() || '' : '';
        const ruleDesc = descElement ? descElement.textContent?.toLowerCase() || '' : '';

        if (ruleName.includes(keyword) || ruleDesc.includes(keyword)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
});


/**
 * ==========================================
 * 3. 動画解説ページ：動画プレビューとAI解析ダミー
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', () => {
  const videoUpload = document.getElementById('video-upload') as HTMLInputElement | null;
  const urlInput = document.querySelector<HTMLInputElement>('.url-input');
  const analyzeBtn = document.querySelector<HTMLButtonElement>('.btn-analyze');
  const player = document.getElementById('player') as HTMLVideoElement | null;
  const responseArea = document.querySelector<HTMLElement>('.ai-response');

  if (!videoUpload || !urlInput || !analyzeBtn || !player || !responseArea) return;

  // ローカル動画のアップロードプレビュー
  videoUpload.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      urlInput.value = ''; // 排他制御
      const fileURL = URL.createObjectURL(file);
      player.src = fileURL;
      player.style.display = 'block';
    }
  });

  // URL入力の排他制御
  urlInput.addEventListener('input', () => {
    if (urlInput.value) {
      videoUpload.value = '';
    }
  });

  // 解析ボタンクリック処理
  analyzeBtn.addEventListener('click', async () => {
    const urlValue = urlInput.value;
    const fileValue = videoUpload.files?.[0];

    if (!urlValue && !fileValue) {
      alert('YouTubeのURLを入力するか、動画ファイルをアップロードしてください。');
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '解析中...';
    responseArea.innerHTML = '<p>🤖 AIが動画を解析しています。しばらくお待ちください...</p>';

    try {
      // ダミーの待機時間（3秒）
      await new Promise((resolve) => setTimeout(resolve, 3000));

      responseArea.innerHTML = `
        <h4>🏉 解析完了</h4>
        <p><strong>判定:</strong> ハイタックル（危険なプレー）の可能性</p>
        <p><strong>解説:</strong> タックラーの腕がボールキャリアの肩のラインより上に接触しています。これは反則となり、ペナルティが与えられるケースです。</p>
      `;
    } catch (error) {
      responseArea.innerHTML = '<p style="color: red;">エラーが発生しました。もう一度お試しください。</p>';
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '解析を実行する';
    }
  });
});


/**
 * ==========================================
 * 4. クイズページ：正誤判定
 * ==========================================
 */
window.checkAnswer = (selectedNumber: number): void => {
  const resultMessage = document.getElementById('result-message') as HTMLElement | null;
  if (!resultMessage) return;

  const correctAnswer = 15;

  if (selectedNumber === correctAnswer) {
    resultMessage.textContent = "大正解！🎉 ラグビーは1チーム15人で行います。";
    resultMessage.style.color = "#28a745";
    resultMessage.style.fontWeight = "bold";
  } else {
    if (selectedNumber === 11) {
      resultMessage.textContent = "残念！11人はサッカーなどの人数ですね。";
    } else if (selectedNumber === 13) {
      resultMessage.textContent = "おしい！13人は「ラグビーリーグ（13人制ラグビー）」という別のルールの人数です。";
    } else {
      resultMessage.textContent = "不正解です。もう一度考えてみましょう！";
    }
    resultMessage.style.color = "#dc3545";
    resultMessage.style.fontWeight = "normal";
  }
};


/**
 * ==========================================
 * 5. スタジアム解説ページ：詳細へのリンク
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', () => {
  const detailButtons = document.querySelectorAll<HTMLButtonElement>('.btn-detail');

  detailButtons.forEach((button) => {
    button.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const infoContainer = target.closest('.stadium-info') as HTMLElement | null;
      
      if (infoContainer) {
        const titleElement = infoContainer.querySelector('h3');
        if (titleElement && titleElement.textContent) {
          const stadiumName = titleElement.textContent;
          window.location.href = `detail.html?name=${encodeURIComponent(stadiumName)}`;
        }
      }
    });
  });
});


/**
 * ==========================================
 * 6. ポジション図鑑 & プレイヤー図鑑：モーダル制御
 * ==========================================
 */
// ポジションデータ
const positionInfo: Record<string, PositionData> = {
  'PR': { name: 'プロップ(1番・3番)', players: '稲垣啓太選手、具智元選手、クレイグ・ミラー選手 など' },
  'SH': { name: 'スクラムハーフ(9番)', players: '流大選手、齋藤直人選手、ファフ・デクラーク選手 など' },
  'SO': { name: 'スタンドオフ(10番)', players: '松田力也選手、田村優選手、ボーデン・バレット選手 など' }
};

// 選手データ
const playerInfo: Record<string, PlayerData> = {
  'Mounga': { name: 'リッチー・モウンガ', position: 'SO', description: '圧倒的なパス、ラン、キックスキルを兼ね備えたワールドクラスの司令塔...' },
  'Sakate': { name: '坂手 淳史', position: 'HO', description: '埼玉パナソニックワイルドナイツや日本代表で主将を務めるなど...' },
  'Isibashi': { name: '石橋 チューカ', position: 'LO/FL', description: '京都産業大学で活躍する期待の星。「リーチ2世」の呼び声も高く...' }
};

// ポジションモーダルを開く
window.showPlayer = (positionCode: string): void => {
  const modal = document.getElementById('player-modal');
  const title = document.getElementById('modal-position-name');
  const example = document.getElementById('modal-player-example');

  if (!modal || !title || !example) return;

  const data = positionInfo[positionCode];
  if (data) {
    title.textContent = `${data.name}の有名プレイヤー`;
    example.textContent = data.players;
  } else {
    title.textContent = '情報がありません';
    example.textContent = '';
  }
  modal.style.display = 'block';
};

// ポジションモーダルを閉じる
window.closeModal = (): void => {
  const modal = document.getElementById('player-modal');
  if (modal) modal.style.display = 'none';
};

// プレイヤーモーダルを開く
window.openPlayerModal = (playerId: string): void => {
  const modal = document.getElementById('playerModal');
  const modalBody = document.getElementById('modal-body');

  if (!modal || !modalBody) return;

  const player = playerInfo[playerId];
  if (player) {
    modalBody.innerHTML = `
      <h2>${player.name}</h2>
      <div class="player-tag">${player.position}</div>
      <p style="margin-top: 15px; line-height: 1.6;">${player.description}</p>
    `;
    modal.style.display = 'block';
  }
};

// プレイヤーモーダルを閉じる
window.closePlayerModal = (): void => {
  const modal = document.getElementById('playerModal');
  if (modal) modal.style.display = 'none';
};

// モーダルの背景クリックで閉じる処理（統合）
window.addEventListener('click', (event: MouseEvent) => {
  const positionModal = document.getElementById('player-modal');
  const playerModal = document.getElementById('playerModal');
  const target = event.target as HTMLElement;

  if (positionModal && target === positionModal) {
    positionModal.style.display = 'none';
  }
  if (playerModal && target === playerModal) {
    playerModal.style.display = 'none';
  }
});