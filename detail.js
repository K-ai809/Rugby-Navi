'use strict';

// HTMLの読み込みが完了してから処理を実行する
document.addEventListener('DOMContentLoaded', () => {
    
    // 【ステップ3-1】URLから「おまけの情報（パラメータ）」を取得する
    const urlParams = new URLSearchParams(window.location.search);
    const targetName = urlParams.get('name'); // ここに「秩父宮ラグビー場」などが入る

    // 【ステップ3-2】スタジアムの詳しい情報をまとめた「辞書（データベース）」
    const stadiumDatabase = {
        '秩父宮ラグビー場': {
            title: '秩父宮ラグビー場',
            description: '「ラグビーの聖地」と呼ばれる東京のラグビー専用球場です。',
            address: '東京都港区北青山2-8-35'
        },
        '花園ラグビー場': {
            title: '東大阪市花園ラグビー場',
            description: '日本初のラグビー専用スタジアム。高校ラグビーの聖地です。',
            address: '大阪府東大阪市松原南1-1-1'
        },
        'パロマ瑞穂ラグビー場': {
            title: 'パロマ瑞穂ラグビー場',
            description: '愛知県名古屋市にある、歴史深いスタジアムです。',
            address: '愛知県名古屋市瑞穂区山下通5-1'
        }
    };

    // 【ステップ3-3】HTMLで用意した「空箱」を取得する
    // （detail.html に id="stadium-title" などのタグがある前提です）
    const titleBox = document.getElementById('stadium-title');
    const descBox = document.getElementById('stadium-description');
    const addressBox = document.getElementById('stadium-address');

    // 【ステップ3-4】URLから取得した名前が辞書にあるかチェックして、空箱にデータを入れる
    if (targetName && stadiumDatabase[targetName]) {
        const data = stadiumDatabase[targetName];
        
        // 空箱にテキストをセット
        titleBox.textContent = data.title;
        descBox.textContent = data.description;
        addressBox.textContent = '住所: ' + data.address;
        
        // ブラウザのタブのタイトルも変更
        document.title = `${data.title} | ラグビーガイド`;
        
    } else {
        // 万が一、該当するスタジアムがない場合のエラー表示
        titleBox.textContent = 'スタジアムが見つかりません';
        descBox.textContent = '一覧ページから再度選択してください。';
    }
});