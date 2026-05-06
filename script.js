'use strict';

/*ホームのスライドショー*/
window.onload = function() {
    const slides = document.getElementsByClassName("fade");
    let currentIndex = 0;

    // 準備：最初に全部の画像から active を外し、1枚目(0番)だけにつける
    for(let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active"); // 透明マントを着せる
    }
    slides[0].classList.add("active"); // 1枚目だけ透明マントを脱ぐ

    // 3秒ごとに切り替える
    setInterval(function() {
        
        // ① 今見ている画像を「透明」にする
        slides[currentIndex].classList.remove("active");

        // ② 次の画像の番号を決める
        currentIndex = currentIndex + 1;
        if (currentIndex === slides.length) {
            currentIndex = 0;
        }

        // ③ 次の画像を表示
        slides[currentIndex].classList.add("active");

    }, 3000);
};

/*-------------------------------------------------------------------------------*/
/*反則、ルールページ*/
document.addEventListener('DOMContentLoaded', () => {
    // 1. 必要な要素を取得
    const searchForm = document.querySelector('.search-form');
    const searchBox = document.getElementById('search-box');
    const tableRows = document.querySelectorAll('.table tbody tr');

    // 2. 検索ボタン（🔍）を押したときや、Enterキーを押したときのエラー（画面リロード）を防ぐ
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault(); // ページが再読み込みされるのをストップする
        });
    }

    // 3. 検索ボックスに文字が入力されるたびに動かす
    if (searchBox) {
        searchBox.addEventListener('input', () => {
            const keyword = searchBox.value.toLowerCase(); 

            // 4. 表の行を1つずつチェック
            tableRows.forEach(row => {
                const ruleName = row.querySelector('.name').textContent.toLowerCase();
                const ruleDesc = row.querySelectorAll('td')[1].textContent.toLowerCase();

                // 5. キーワードが含まれていれば表示、なければ非表示
                if (ruleName.includes(keyword) || ruleDesc.includes(keyword)) {
                    row.style.display = ''; 
                } else {
                    row.style.display = 'none'; 
                }
            });
        });
    }
});


/*----------------------------------------------------------------------------------------*/
/*動画解析ページ*/
document.addEventListener('DOMContentLoaded', () => {
    const videoUpload = document.getElementById('video-upload');
    const urlInput = document.querySelector('.url-input');
    const analyzeBtn = document.querySelector('.btn-analyze');
    const player = document.getElementById('player');
    const responseArea = document.querySelector('.ai-response');

    // 1. ローカル動画がアップロードされたらプレビューを表示する
    videoUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // URL入力欄をクリアする（排他制御）
            urlInput.value = ''; 
            
            // ファイルのURLを生成してビデオプレイヤーにセット
            const fileURL = URL.createObjectURL(file);
            player.src = fileURL;
            player.style.display = 'block'; // プレイヤーを表示
        }
    });

    // URLが入力されたらファイルの選択を解除する（排他制御）
    urlInput.addEventListener('input', () => {
        if (urlInput.value) {
            videoUpload.value = '';
        }
    });

    // 2. 「解析を実行する」ボタンが押された時の処理
    analyzeBtn.addEventListener('click', async () => {
        const urlValue = urlInput.value;
        const fileValue = videoUpload.files[0];

        // どちらも空の場合はアラートを出す
        if (!urlValue && !fileValue) {
            alert('YouTubeのURLを入力するか、動画ファイルをアップロードしてください。');
            return;
        }

        // 解析中のローディング表示
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '解析中...';
        responseArea.innerHTML = '<p>🤖 AIが動画を解析しています。しばらくお待ちください...</p>';

        try {
            // =========================================================
            // 本来はここでバックエンド（サーバー）にデータを送信。今回はダミーのタイマー用意
          
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 解析結果のダミー表示
            responseArea.innerHTML = `
                <h4>🏉 解析完了</h4>
                <p><strong>判定:</strong> ハイタックル（危険なプレー）の可能性</p>
                <p><strong>解説:</strong> タックラーの腕がボールキャリアの肩のラインより上に接触しています。これは反則となり、ペナルティが与えられるケースです。</p>
            `;
        } catch (error) {
            responseArea.innerHTML = '<p style="color: red;">エラーが発生しました。もう一度お試しください。</p>';
        } finally {
            // ボタンの状態を元に戻す
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = '解析を実行する';
        }
    });
});

/*-------------------------------------------------------------------------------------------*/
/*クイズページ*/
// 回答をチェックする関数
function checkAnswer(selectedNumber) {
    // 結果を表示するHTML要素（divタグ）を取得
    const resultMessage = document.getElementById('result-message');

    // ラグビー（15人制ラグビー）の正解人数
    const correctAnswer = 15;

    // 正誤判定
    if (selectedNumber === correctAnswer) {
        // 正解の場合のメッセージとスタイル
        resultMessage.textContent = "大正解！🎉 ラグビーは1チーム15人で行います。";
        resultMessage.style.color = "#28a745"; // 緑色
        resultMessage.style.fontWeight = "bold";
    } else {
        // 不正解の場合のメッセージとスタイル
        if (selectedNumber === 11) {
            resultMessage.textContent = "残念！11人はサッカーなどの人数ですね。";
        } else if (selectedNumber === 13) {
            resultMessage.textContent = "おしい！13人は「ラグビーリーグ（13人制ラグビー）」という別のルールの人数です。";
        } else {
            resultMessage.textContent = "不正解です。もう一度考えてみましょう！";
        }
        resultMessage.style.color = "#dc3545"; // 赤色
        resultMessage.style.fontWeight = "normal";
    }
}


/*----------------------------------------------------------------------------------------------------------*/
/*スタジアム解説ページ*/ 
// HTMLの読み込みが完了してから処理を実行する
document.addEventListener('DOMContentLoaded', () => {
    
    // 「詳細・行き方を見る」ボタンをすべて取得
    const detailButtons = document.querySelectorAll('.btn-detail');

    // 取得したすべてのボタンに対してクリックイベントを設定
    detailButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            
            // クリックされたボタンの親要素（.stadium-info）を取得
            const infoContainer = event.target.closest('.stadium-info');
            
            // その中にあるスタジアム名（h3タグ）のテキストを取得
            const stadiumName = infoContainer.querySelector('h3').textContent;
            
            // 【ステップ1】URLパラメータをつけて detail.html に移動
            // encodeURIComponent で日本語の文字化けを防ぐ
            window.location.href = `detail.html?name=${encodeURIComponent(stadiumName)}`;
            
        });
    });
});

/*---------------------------------------------------------------------------------------------------*/
/*ポジション図鑑ページ*/
// ポジションごとのデータ（ポジション名と有名選手のリスト）をオブジェクトで定義
const PlayerData = {
    'PR': {
        name: 'プロップ(1番・3番)',
        players: '稲垣啓太選手、具智元選手、クレイグ・ミラー選手 など'
    },
    'SH': {
        name: 'スクラムハーフ(9番)',
        players: '流大選手、齋藤直人選手、ファフ・デクラーク選手 など'
    },
    'SO': {
        name: 'スタンドオフ(10番)',
        players: '松田力也選手、田村優選手、ボーデン・バレット選手 など'
    }
};

// モーダルを表示する関数（HTMLの onclick="showPlayer('PR')" などで呼び出される）
function showPlayer(positionCode) {
    // 操作するHTML要素を取得
    const modal = document.getElementById('player-modal');
    const title = document.getElementById('modal-position-name');
    const example = document.getElementById('modal-player-example');

    // 引数(positionCode)に対応するデータが存在するか確認
    if (playerData[positionCode]) {
        // モーダル内のテキストを書き換える
        title.textContent = playerData[positionCode].name + 'の有名プレイヤー';
        example.textContent = playerData[positionCode].players;
    } else {
        title.textContent = '情報がありません';
        example.textContent = '';
    }

    // モーダルを表示する（CSSの display プロパティを 'block' に変更）
    modal.style.display = 'block';
}

// モーダルを閉じる関数（HTMLの onclick="closeModal()" で呼び出される）
function closeModal() {
    const modal = document.getElementById('player-modal');
    // モーダルを非表示にする（CSSの display プロパティを 'none' に変更）
    modal.style.display = 'none';
}

// モーダルの外側（背景部分）をクリックしたときにも閉じるようにする
window.onclick = function(event) {
    const modal = document.getElementById('player-modal');
    // クリックされた場所（event.target）がモーダルの背景領域だった場合
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}; 

//------------------------------------------------------------------------------------------------------
// プレイヤー図鑑ページ
// 1. モーダルに表示する選手の詳細データを定義
const playerData = {
    'Mounga': {
        name: 'リッチー・モウンガ',
        position: 'SO',
        description: '圧倒的なパス、ラン、キックスキルを兼ね備えたワールドクラスの司令塔。ニュージーランド代表としての経験も豊富で、試合を支配する力を持っています。'
    },
    'Sakate': {
        name: '坂手 淳史',
        position: 'HO',
        description: '埼玉パナソニックワイルドナイツや日本代表で主将を務めるなど、優れたリーダーシップを発揮。スクラムの安定感とフィールドプレーの質の高さが持ち味です。'
    },
    'Isibashi': {
        name: '石橋 チューカ',
        position: 'LO/FL',
        description: '京都産業大学で活躍する期待の星。「リーチ2世」の呼び声も高く、規格外の身体能力を活かしたボールキャリーと激しいタックルでファンを魅了します。'
    }
};

// 2. モーダルを開く関数（HTMLの onclick で呼ばれる）
function openPlayerModal(playerId) {
    const modal = document.getElementById('playerModal');
    const modalBody = document.getElementById('modal-body');
    const player = playerData[playerId]; // IDに一致するデータを取得

    if (player) {
        // モーダルの中身（HTML）を動的に生成
        modalBody.innerHTML = `
            <h2>${player.name}</h2>
            <div class="player-tag">${player.position}</div>
            <p style="margin-top: 15px; line-height: 1.6;">${player.description}</p>
        `;
        // モーダルを表示
        modal.style.display = 'block';
    }
}

// 3. モーダルを閉じる関数（×ボタンで呼ばれる）
function closePlayerModal() {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'none';
}

// 4. モーダルの外側（背景）をクリックした時にも閉じるようにする（UX向上のため）
window.onclick = function(event) {
    const modal = document.getElementById('playerModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}