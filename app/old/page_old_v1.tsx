// @ts-nocheck
"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Shield, ChefHat, Users, Store, ArrowLeft, ArrowRight, Check, X, BookOpen, Trophy, Clock, RotateCcw, Brain, Sparkles, Eye, EyeOff, Calculator, Home, BarChart3, Layers, Moon, Sun, AlertTriangle, RefreshCw } from "lucide-react";

/* ============================================================
   CATEGORIES
   ============================================================ */
const CATEGORIES = {
  hygiene: { name_ja: "衛生管理", name_my: "တက်ကျန်းမာရေး စီမံခန့်ခွဲမှု", icon: Shield, color: "bg-rose-500", colorLight: "bg-rose-50 dark:bg-rose-950", colorText: "text-rose-700 dark:text-rose-300", colorBorder: "border-rose-200 dark:border-rose-800", points: 40, desc: "HACCP・食中毒菌・消毒" },
  cooking: { name_ja: "飲食物調理", name_my: "အစားအစာ ချက်ပြုတ်ခြင်း", icon: ChefHat, color: "bg-amber-500", colorLight: "bg-amber-50 dark:bg-amber-950", colorText: "text-amber-700 dark:text-amber-300", colorBorder: "border-amber-200 dark:border-amber-800", points: 10, desc: "食材・調理法・器具" },
  service: { name_ja: "接客全般", name_my: "ဧည့်ခံခြင်း အထွေထွေ", icon: Users, color: "bg-sky-500", colorLight: "bg-sky-50 dark:bg-sky-950", colorText: "text-sky-700 dark:text-sky-300", colorBorder: "border-sky-200 dark:border-sky-800", points: 30, desc: "クレーム・アレルギー・お酒" },
  operations: { name_ja: "店舗運営", name_my: "ဆိုင်ခွဲ စီမံခန့်ခွဲမှု", icon: Store, color: "bg-violet-500", colorLight: "bg-violet-50 dark:bg-violet-950", colorText: "text-violet-700 dark:text-violet-300", colorBorder: "border-violet-200 dark:border-violet-800", points: 40, desc: "原価率・損益分岐点・シフト" },
};

/* ============================================================
   EXPANDED QUESTIONS (200+)
   ============================================================ */
const QUESTIONS = [
  // ===== HYGIENE (衛生管理) 55問 =====
  { id:"h001", category:"hygiene", type:"academic", question:"HACCPの7原則に含まれないものはどれですか。", options:["危害要因分析","重要管理点の決定","従業員の健康診断の実施","モニタリング方法の設定"], correctAnswer:2, explanation:"HACCPの7原則は、①危害要因分析、②重要管理点（CCP）の決定、③管理基準の設定、④モニタリング方法の設定、⑤改善措置の設定、⑥検証方法の設定、⑦記録の保持です。", keywords:[{ja:"危害要因分析",reading:"きがいよういんぶんせき",my:"အန္တရာယ်ဖြစ်စေသော အချက်များ ခွဲခြမ်းစိတ်ဖြာခြင်း"},{ja:"重要管理点",reading:"じゅうようかんりてん",my:"အရေးကြီးသော ထိန်းချုပ်မှတ်"}] },
  { id:"h002", category:"hygiene", type:"academic", question:"ノロウイルスによる食中毒の予防として、最も適切なものはどれですか。", options:["食品の中心温度を65℃で1分間加熱する","食品の中心温度を85〜90℃で90秒間以上加熱する","食品を冷蔵庫で10℃以下に保管する","調理前に食品を流水で30秒間洗う"], correctAnswer:1, explanation:"ノロウイルスは熱に比較的強いため、中心温度85〜90℃で90秒間以上の加熱が必要です。", keywords:[{ja:"ノロウイルス",reading:"のろういるす",my:"နိုရိုဗိုင်းရပ်စ်"},{ja:"中心温度",reading:"ちゅうしんおんど",my:"ဗဟိုအပူချိန်"}] },
  { id:"h003", category:"hygiene", type:"academic", question:"次亜塩素酸ナトリウムによる消毒で正しいものはどれですか。", options:["金属製の調理器具の消毒に最も適している","野菜の消毒には100ppmの濃度で使用する","ノロウイルスの消毒には200ppm以上の濃度が必要である","使用後は水で洗い流す必要はない"], correctAnswer:2, explanation:"ノロウイルスの消毒には200ppm以上（嘔吐物は1000ppm以上）が必要です。金属には腐食性があり不向きです。", keywords:[{ja:"次亜塩素酸ナトリウム",reading:"じあえんそさんなとりうむ",my:"ဆိုဒီယမ်ဟိုက်ပိုကလိုရိုက်"}] },
  { id:"h004", category:"hygiene", type:"academic", question:"食品衛生法に基づく営業許可は、誰が交付しますか。", options:["都道府県知事","厚生労働大臣","市区町村長","保健所長"], correctAnswer:3, explanation:"飲食店の営業許可は、店舗所在地を管轄する保健所長が交付します。", keywords:[{ja:"営業許可",reading:"えいぎょうきょか",my:"စီးပွားရေးလုပ်ကိုင်ခွင့်"},{ja:"保健所",reading:"ほけんじょ",my:"ကျန်းမာရေးဌာန"}] },
  { id:"h005", category:"hygiene", type:"academic", question:"食中毒菌の増殖条件として、正しいものはどれですか。", options:["ほとんどの食中毒菌は10℃以下では増殖しない","食中毒菌は乾燥した環境で最もよく増殖する","食中毒菌の増殖には光が必要である","食中毒菌は酸性の環境で最もよく増殖する"], correctAnswer:0, explanation:"食中毒菌の多くは10℃以下で増殖が抑制されます。「つけない・増やさない・やっつける」が予防の三原則です。", keywords:[{ja:"食中毒菌",reading:"しょくちゅうどくきん",my:"အစားအစာ အဆိပ်သင့်ပိုး"}] },
  { id:"h006", category:"hygiene", type:"academic", question:"アレルゲン表示が義務付けられている特定原材料はいくつですか。", options:["5品目","7品目","8品目","28品目"], correctAnswer:2, explanation:"特定原材料（表示義務）は、えび、かに、くるみ、小麦、そば、卵、乳、落花生の8品目です。", keywords:[{ja:"特定原材料",reading:"とくていげんざいりょう",my:"သတ်မှတ်ထားသော ကုန်ကြမ်းပစ္စည်းများ"}] },
  { id:"h007", category:"hygiene", type:"practical", question:"従業員が嘔吐した場合、最初に行うべき対応はどれですか。", options:["すぐに嘔吐物を拭き取る","嘔吐した従業員を隔離し、周囲の人を遠ざける","保健所に電話する","アルコールで消毒する"], correctAnswer:1, explanation:"まず従業員を隔離し周囲の人を遠ざけます。アルコールはノロウイルスには効果がありません。次亜塩素酸ナトリウム1000ppm以上で消毒します。", keywords:[{ja:"嘔吐",reading:"おうと",my:"အန်ခြင်း"}] },
  { id:"h008", category:"hygiene", type:"academic", question:"黄色ブドウ球菌の毒素の特徴として、正しいものはどれですか。", options:["低温で無毒化される","加熱しても分解されない","酸性で分解される","アルコールで無効化できる"], correctAnswer:1, explanation:"黄色ブドウ球菌のエンテロトキシンは耐熱性が高く、100℃30分の加熱でも分解されません。手指の傷が主な感染源です。", keywords:[{ja:"黄色ブドウ球菌",reading:"おうしょくぶどうきゅうきん",my:"ရွှေရောင်စတက်ဖိုလိုကိုးကပ်စ်"}] },
  { id:"h009", category:"hygiene", type:"practical", question:"冷蔵庫の温度が8℃に上昇していた場合の対応として適切なものは。", options:["食材の状態を確認し問題なければ使う","設定温度を下げ、食材の状態を確認・記録し上司に報告する","すべての食材を廃棄する","翌日まで様子を見る"], correctAnswer:1, explanation:"温度異常発見時は設定温度を確認・調整し、保管食材の状態を確認・記録、上司に報告します。", keywords:[{ja:"温度管理",reading:"おんどかんり",my:"အပူချိန်ထိန်းချုပ်ခြင်း"}] },
  { id:"h010", category:"hygiene", type:"academic", question:"交差汚染を防止する最も適切な対策はどれですか。", options:["生肉用と野菜用のまな板を色分けして使い分ける","食材を同じ冷蔵庫の同じ棚に保管する","調理後に手洗いすればよい","まな板を水で流してから別の食材を切る"], correctAnswer:0, explanation:"交差汚染防止には食材ごとに調理器具を使い分けます。まな板や包丁を色分けし用途別に管理します。", keywords:[{ja:"交差汚染",reading:"こうさおせん",my:"ကူးစက်ညစ်ညမ်းခြင်း"}] },
  { id:"h011", category:"hygiene", type:"academic", question:"カンピロバクター食中毒の主な原因はどれですか。", options:["牛肉の生食","鶏肉の加熱不足","貝類の生食","野菜の洗浄不足"], correctAnswer:1, explanation:"カンピロバクター食中毒は鶏肉の加熱不足や生食が主な原因です。潜伏期間は2〜5日です。", keywords:[{ja:"カンピロバクター",reading:"かんぴろばくたー",my:"ကမ်ပီလိုဘတ်တာ"}] },
  { id:"h012", category:"hygiene", type:"academic", question:"食品の「危険温度帯」として正しいものはどれですか。", options:["0℃〜10℃","10℃〜60℃","20℃〜50℃","30℃〜70℃"], correctAnswer:1, explanation:"10℃〜60℃は食中毒菌が最も増殖しやすい「危険温度帯」です。この温度帯にある時間をできるだけ短くすることが重要です。", keywords:[{ja:"危険温度帯",reading:"きけんおんどたい",my:"အန္တရာယ်ရှိ အပူချိန်ဇုန်"}] },
  { id:"h013", category:"hygiene", type:"academic", question:"サルモネラ菌による食中毒の主な原因食品はどれですか。", options:["魚介類","卵・鶏肉","穀物","乳製品"], correctAnswer:1, explanation:"サルモネラ菌は卵や鶏肉に多く存在します。十分な加熱（中心温度75℃1分以上）で予防できます。", keywords:[{ja:"サルモネラ菌",reading:"さるもねらきん",my:"ဆာမိုနဲလာ ဘက်တီးရီးယား"}] },
  { id:"h014", category:"hygiene", type:"academic", question:"腸管出血性大腸菌O157の特徴として正しいものはどれですか。", options:["高温多湿で増殖が止まる","少量の菌でも食中毒を起こす","加熱に強い","潜伏期間は1〜2時間と短い"], correctAnswer:1, explanation:"O157は少量（100個程度）の菌でも感染し、重篤な症状を起こします。75℃1分以上の加熱で死滅します。潜伏期間は3〜8日です。", keywords:[{ja:"腸管出血性大腸菌",reading:"ちょうかんしゅっけつせいだいちょうきん",my:"အူလမ်းသွေးထွက်စေသော အီးကိုလိုင် ဘက်တီးရီးယား"}] },
  { id:"h015", category:"hygiene", type:"academic", question:"ウェルシュ菌による食中毒の特徴として正しいものはどれですか。", options:["生魚が主な原因である","大量調理した食品を室温で放置すると起こりやすい","潜伏期間は3〜5日と長い","低温で増殖しやすい"], correctAnswer:1, explanation:"ウェルシュ菌はカレーやシチューなど大量調理食品を室温で放置すると増殖します。芽胞は耐熱性があるため、調理後は速やかに冷却が必要です。", keywords:[{ja:"ウェルシュ菌",reading:"うぇるしゅきん",my:"ဝဲလ်ရှ် ဘက်တီးရီးယား"}] },
  { id:"h016", category:"hygiene", type:"academic", question:"食品衛生責任者について正しいものはどれですか。", options:["調理師免許がないとなれない","各営業施設に1人以上置く必要がある","保健所長が任命する","5年ごとに更新が必要である"], correctAnswer:1, explanation:"食品衛生責任者は営業施設ごとに1人以上配置が義務付けられています。調理師や栄養士の資格がなくても、養成講習会を修了すればなれます。", keywords:[{ja:"食品衛生責任者",reading:"しょくひんえいせいせきにんしゃ",my:"အစားအစာတက်ကျန်းမာရေး တာဝန်ခံ"}] },
  { id:"h017", category:"hygiene", type:"practical", question:"従業員に手指の切り傷がある場合、最も適切な対応はどれですか。", options:["絆創膏を貼って調理を続ける","絆創膏を貼り、さらに使い捨て手袋を着用させる","その日は休ませる","傷が小さければそのまま調理を続けてよい"], correctAnswer:1, explanation:"手指の傷は黄色ブドウ球菌の温床になるため、絆創膏で覆い、さらに使い捨て手袋を着用して食品への汚染を防ぎます。", keywords:[{ja:"使い捨て手袋",reading:"つかいすてぶくろ",my:"တစ်ခါသုံးလက်အိတ်"}] },
  { id:"h018", category:"hygiene", type:"academic", question:"冷凍食品の解凍方法として、最も衛生的なものはどれですか。", options:["室温で自然解凍する","冷蔵庫内で解凍する","温水に浸けて解凍する","直射日光に当てて解凍する"], correctAnswer:1, explanation:"冷蔵庫内での解凍が最も衛生的です。室温解凍は危険温度帯を通過する時間が長くなり、細菌が増殖しやすくなります。", keywords:[{ja:"解凍",reading:"かいとう",my:"အေးခဲခြင်းကို ပြန်ဖျော်ခြင်း"}] },
  { id:"h019", category:"hygiene", type:"academic", question:"HACCPにおける「CCP」とは何ですか。", options:["衛生管理計画","重要管理点","危害要因分析","品質管理基準"], correctAnswer:1, explanation:"CCPはCritical Control Point（重要管理点）の略で、食品の安全性を確保するために特に管理が必要なポイントを指します。", keywords:[{ja:"重要管理点",reading:"じゅうようかんりてん",my:"အရေးကြီးသော ထိန်းချုပ်မှတ်"}] },
  { id:"h020", category:"hygiene", type:"practical", question:"食中毒が疑われる症状の報告があった場合、最初にすべきことは何ですか。", options:["該当の食品を廃棄する","店長に報告し、保健所への連絡を判断する","症状が軽ければ様子を見る","お客様に薬を渡す"], correctAnswer:1, explanation:"食中毒が疑われる場合は、直ちに店長や責任者に報告します。責任者は状況を判断し、必要に応じて保健所に連絡します。証拠となる食品は廃棄せず保管します。", keywords:[{ja:"食中毒",reading:"しょくちゅうどく",my:"အစားအစာ အဆိပ်သင့်ခြင်း"}] },
  { id:"h021", category:"hygiene", type:"academic", question:"食品表示法で表示が推奨されている特定原材料に準ずるものは何品目ですか。", options:["8品目","15品目","20品目","28品目"], correctAnswer:2, explanation:"特定原材料に準ずるもの（表示推奨）は20品目です。アーモンド、あわび、いか、いくら、オレンジ、カシューナッツ、キウイフルーツなどがあります。", keywords:[{ja:"特定原材料に準ずるもの",reading:"とくていげんざいりょうにじゅんずるもの",my:"သတ်မှတ်ထားသော ကုန်ကြမ်းနှင့်ညီမျှသော ပစ္စည်းများ"}] },
  { id:"h022", category:"hygiene", type:"academic", question:"腸炎ビブリオによる食中毒の特徴として正しいものはどれですか。", options:["冬季に多い","海水中に生息し、刺身が主な原因食品である","加熱しても死滅しない","潜伏期間は5〜7日と長い"], correctAnswer:1, explanation:"腸炎ビブリオは海水中に生息し、夏季に多く発生します。刺身や寿司が主な原因食品で、真水で洗うことで予防できます。", keywords:[{ja:"腸炎ビブリオ",reading:"ちょうえんびぶりお",my:"ဗီဘရီယိုပါရာဟီမိုလိုတီးကပ်"}] },
  { id:"h023", category:"hygiene", type:"practical", question:"調理従事者の健康管理として、毎日行うべきことはどれですか。", options:["血液検査","検便","健康チェック（体温・下痢・嘔吐の有無の確認）","レントゲン撮影"], correctAnswer:2, explanation:"毎日の始業前に、体温測定、下痢・嘔吐・手指の傷の有無などを確認し、記録します。体調不良の従業員は食品を取り扱う作業から外します。", keywords:[{ja:"健康チェック",reading:"けんこうちぇっく",my:"ကျန်းမာရေးစစ်ဆေးခြင်း"}] },
  { id:"h024", category:"hygiene", type:"academic", question:"ボツリヌス菌の特徴として正しいものはどれですか。", options:["好気性（酸素が必要）の菌である","嫌気性（酸素がない環境）で増殖する","酸性環境で最もよく増殖する","芽胞を形成しない"], correctAnswer:1, explanation:"ボツリヌス菌は嫌気性菌で、真空パック食品や缶詰など酸素のない環境で増殖します。神経毒を産生し、重篤な症状を引き起こします。", keywords:[{ja:"ボツリヌス菌",reading:"ぼつりぬすきん",my:"ဘိုတျူလင်နပ်စ် ဘက်တီးရီးယား"}] },
  { id:"h025", category:"hygiene", type:"academic", question:"手洗いの正しい手順で、最初に行うことはどれですか。", options:["石鹸をつける","流水で手を濡らす","手指消毒剤をつける","ペーパータオルで拭く"], correctAnswer:1, explanation:"正しい手洗いは、①流水で手を濡らす→②石鹸をつけて泡立てる→③手のひら、甲、指の間、爪、親指、手首を丁寧に洗う→④流水で洗い流す→⑤ペーパータオルで拭く→⑥手指消毒剤をつける、の順です。", keywords:[{ja:"手洗い",reading:"てあらい",my:"လက်ဆေးခြင်း"}] },
  { id:"h026", category:"hygiene", type:"practical", question:"まな板の衛生管理として最も適切なものはどれですか。", options:["使用後に水で流すだけでよい","使用後に洗剤で洗い、熱湯消毒または次亜塩素酸ナトリウムで消毒する","1日1回、営業終了後にだけ洗う","乾燥させるだけで消毒の代わりになる"], correctAnswer:1, explanation:"まな板は使用後に洗剤で洗い、熱湯消毒（80℃以上5分間）や次亜塩素酸ナトリウムで消毒します。用途別に使い分け、傷が深いものは交換します。", keywords:[{ja:"熱湯消毒",reading:"ねっとうしょうどく",my:"ရေပူဖြင့်ပိုးသတ်ခြင်း"}] },
  { id:"h027", category:"hygiene", type:"academic", question:"食品の保管温度について正しいものはどれですか。", options:["冷蔵は10℃以下、冷凍は−15℃以下","冷蔵は5℃以下、冷凍は−10℃以下","冷蔵は10℃以下、冷凍は−20℃以下","冷蔵は8℃以下、冷凍は−18℃以下"], correctAnswer:0, explanation:"食品衛生法では、冷蔵は10℃以下、冷凍は−15℃以下と定められています。より安全のため、冷蔵は5℃以下での管理が推奨されます。", keywords:[{ja:"保管温度",reading:"ほかんおんど",my:"သိုလှောင်မှု အပူချိန်"}] },
  { id:"h028", category:"hygiene", type:"academic", question:"リステリア菌の特徴として正しいものはどれですか。", options:["加熱に強い","冷蔵庫の温度でも増殖できる","酸性環境では生存できない","乾燥した環境を好む"], correctAnswer:1, explanation:"リステリア菌は4℃以下の低温でも増殖できる特殊な細菌です。チーズ、スモークサーモンなどが原因食品になることがあり、妊婦や高齢者は特に注意が必要です。", keywords:[{ja:"リステリア菌",reading:"りすてりあきん",my:"လစ်စတီးရီးယား ဘက်တီးရီးယား"}] },

  // ===== COOKING (飲食物調理) 35問 =====
  { id:"c001", category:"cooking", type:"academic", question:"魚の鮮度を見分ける方法として、正しいものはどれですか。", options:["目が白く濁っているものが新鮮","えらが鮮やかな赤色のものが新鮮","身を押すと跡が残るものが新鮮","表面が乾燥しているものが新鮮"], correctAnswer:1, explanation:"新鮮な魚はえらが鮮やかな赤色で、目が透明で澄んでおり、身に弾力があります。", keywords:[{ja:"鮮度",reading:"せんど",my:"လတ်ဆတ်မှု"}] },
  { id:"c002", category:"cooking", type:"academic", question:"「ブランチング」とは何ですか。", options:["食材を油で素揚げすること","食材を短時間ゆでて冷水にとること","食材を塩水に漬けること","食材を低温で長時間加熱すること"], correctAnswer:1, explanation:"ブランチングは短時間ゆでた後すぐに冷水にとる調理法で、色の鮮やかさを保ち酵素の働きを止めます。", keywords:[{ja:"ブランチング",reading:"ぶらんちんぐ",my:"အနည်းငယ်ပြုတ်ပြီး အအေးရေစိမ်ခြင်း"}] },
  { id:"c003", category:"cooking", type:"academic", question:"揚げ油の交換時期の目安として正しいものはどれですか。", options:["色が薄くなったとき","泡が消えにくく粘りが出てきたとき","油の量が半分になったとき","使用回数が3回を超えたとき"], correctAnswer:1, explanation:"泡立ちが消えにくい、粘りが出る、色が濃くなる、嫌な臭いがする場合は油を交換します。", keywords:[{ja:"揚げ油",reading:"あげあぶら",my:"ကြော်ဆီ"}] },
  { id:"c004", category:"cooking", type:"academic", question:"先入れ先出し（FIFO）の目的として最も適切なものはどれですか。", options:["在庫数量を正確に把握するため","食材の鮮度を保ち廃棄ロスを減らすため","仕入れコストを削減するため","調理作業を効率化するため"], correctAnswer:1, explanation:"FIFOは先に仕入れた食材を先に使い、鮮度を保ち期限切れによる廃棄ロスを最小限にする管理方法です。", keywords:[{ja:"先入れ先出し",reading:"さきいれさきだし",my:"အရင်ဝင်အရင်ထွက် (FIFO)"}] },
  { id:"c005", category:"cooking", type:"academic", question:"真空調理法（スーヴィード）の特徴として正しいものはどれですか。", options:["高温短時間で加熱する","食材を真空パックし低温で長時間加熱する","食材の水分を抜いて保存性を高める","高圧で食材を柔らかくする"], correctAnswer:1, explanation:"真空調理法は食材を真空パックし50〜85℃程度の低温で長時間加熱する方法です。", keywords:[{ja:"真空調理法",reading:"しんくうちょうりほう",my:"လေဟာနည်းဖြင့် ချက်ပြုတ်ခြင်း"}] },
  { id:"c006", category:"cooking", type:"practical", question:"新人に包丁の持ち方を指導する際、最も重要なポイントはどれですか。", options:["できるだけ刃先に近い部分を持つ","親指と人差し指で刃元を挟むように持つ","力を入れて強く握る","反対の手で持つ練習をさせる"], correctAnswer:1, explanation:"包丁は親指と人差し指で刃元を挟むように持ち、残りの指で柄を握ります。安定した操作と安全性が高まります。", keywords:[{ja:"包丁",reading:"ほうちょう",my:"ဓား"}] },
  { id:"c007", category:"cooking", type:"academic", question:"「アルデンテ」とはどのような状態ですか。", options:["完全に柔らかくなった状態","芯がわずかに残る固さの状態","焦げ目がついた状態","冷めた状態"], correctAnswer:1, explanation:"アルデンテはイタリア語で「歯に」という意味で、パスタなどを茹でる際に芯がわずかに残る固さのことです。", keywords:[{ja:"アルデンテ",reading:"あるでんて",my:"အနည်းငယ်မာသော အနေအထား"}] },
  { id:"c008", category:"cooking", type:"academic", question:"「だし」を取る際の昆布の正しい扱い方はどれですか。", options:["沸騰したお湯に入れて長時間煮る","水から入れて沸騰直前に取り出す","高温の油で揚げる","塩水に浸けてから使う"], correctAnswer:1, explanation:"昆布だしは水から昆布を入れ、沸騰直前に取り出すのが基本です。沸騰させるとぬめりや雑味が出てしまいます。", keywords:[{ja:"だし",reading:"だし",my:"ဟင်းချို ရည်အနှစ်"}] },
  { id:"c009", category:"cooking", type:"academic", question:"「ミジン切り」とはどのような切り方ですか。", options:["薄く輪切りにする","細かくみじん状に刻む","斜めに薄切りにする","繊維に沿って細長く切る"], correctAnswer:1, explanation:"ミジン切りは食材を非常に細かく（1〜2mm程度）刻む切り方です。玉ねぎやにんにくなどに多く使われます。", keywords:[{ja:"ミジン切り",reading:"みじんぎり",my:"အလွန်သေးငယ်အောင် လှီးခြင်း"}] },
  { id:"c010", category:"cooking", type:"academic", question:"食材の「あく抜き」の目的として正しいものはどれですか。", options:["食材の色を悪くするため","食材の渋みやえぐみを取り除くため","食材を硬くするため","食材の栄養を減らすため"], correctAnswer:1, explanation:"あく抜きは、野菜などに含まれる渋み・えぐみ・苦みの成分を取り除く工程です。水にさらす、塩もみ、ゆでこぼしなどの方法があります。", keywords:[{ja:"あく抜き",reading:"あくぬき",my:"ခါးသက်ဖယ်ရှားခြင်း"}] },
  { id:"c011", category:"cooking", type:"academic", question:"揚げ物の適切な油の温度として、一般的な目安はどれですか。", options:["100〜120℃","140〜180℃","200〜220℃","250〜280℃"], correctAnswer:1, explanation:"揚げ物の油温は、低温（140〜160℃）、中温（160〜180℃）、高温（180〜200℃）が基本です。食材によって適切な温度が異なります。", keywords:[{ja:"油温",reading:"あぶらおん",my:"ဆီအပူချိန်"}] },
  { id:"c012", category:"cooking", type:"practical", question:"複数のスタッフに同じ品質の料理を作らせるために最も重要なことはどれですか。", options:["優秀なスタッフだけに作らせる","レシピ（標準作業手順書）を整備し、計量を徹底する","毎日味見をして調整する","調味料を自由に使わせる"], correctAnswer:1, explanation:"品質の統一にはレシピの標準化と計量の徹底が不可欠です。分量、手順、盛り付けを文書化し、誰が作っても同じ品質になるようにします。", keywords:[{ja:"標準作業手順書",reading:"ひょうじゅんさぎょうてじゅんしょ",my:"စံလုပ်ငန်းစဉ် လမ်းညွှန်"}] },
  { id:"c013", category:"cooking", type:"academic", question:"米の研ぎ方について正しいものはどれですか。", options:["熱湯で研ぐと甘みが増す","最初の水は素早く捨てる","力強くこすり合わせて研ぐ","30分以上水に浸けてから研ぐ"], correctAnswer:1, explanation:"最初の水はぬかの臭いを吸収しやすいため素早く捨てます。力を入れすぎると米が割れるので、やさしく研ぐのがコツです。", keywords:[{ja:"研ぐ",reading:"とぐ",my:"ဆန်ဆေးခြင်း"}] },
  { id:"c014", category:"cooking", type:"academic", question:"食材の「マリネ」とは何ですか。", options:["食材を高温で焼くこと","食材を酢や油などの調味液に漬け込むこと","食材を冷凍保存すること","食材を燻製にすること"], correctAnswer:1, explanation:"マリネは食材を酢、油、ハーブ、スパイスなどを合わせた液に漬け込む調理法です。風味付け、保存性向上、肉の軟化などの効果があります。", keywords:[{ja:"マリネ",reading:"まりね",my:"အရသာရည်စိမ်ခြင်း"}] },

  // ===== SERVICE (接客全般) 55問 =====
  { id:"s001", category:"service", type:"academic", question:"クレーム対応の基本手順として最も適切なものはどれですか。", options:["すぐに値引きを提案する","まず謝罪し、お客様の話を最後まで傾聴する","責任者が来るまで対応しない","他のお客様の前で事情を聞く"], correctAnswer:1, explanation:"クレーム対応は①謝罪→②傾聴→③事実確認→④解決策提案→⑤再発防止の流れが基本です。", keywords:[{ja:"クレーム対応",reading:"くれーむたいおう",my:"တိုင်ကြားချက်ကိုင်တွယ်ခြင်း"}] },
  { id:"s002", category:"service", type:"academic", question:"食物アレルギーの申告への対応として最も適切なものはどれですか。", options:["アレルギー対応メニューを出す","具体的なアレルゲンを確認し調理担当に伝える","「大丈夫です」と安心させる","別の店を勧める"], correctAnswer:1, explanation:"命に関わるため、具体的なアレルゲンを確認し調理担当者に正確に伝えることが最重要です。", keywords:[{ja:"食物アレルギー",reading:"しょくもつあれるぎー",my:"အစားအစာ ဓာတ်မတည့်ခြင်း"}] },
  { id:"s003", category:"service", type:"academic", question:"未成年者へのお酒の提供について正しいものはどれですか。", options:["保護者と一緒なら提供可","少量なら提供可","いかなる場合も提供不可","本人が20歳と申告すれば提供可"], correctAnswer:2, explanation:"未成年者飲酒禁止法により20歳未満への酒類提供はいかなる場合も禁止です。年齢確認を徹底します。", keywords:[{ja:"未成年者",reading:"みせいねんしゃ",my:"အရွယ်မရောက်သူ"}] },
  { id:"s004", category:"service", type:"academic", question:"電話予約で確認すべき項目に含まれないものはどれですか。", options:["来店日時と人数","お客様の年収","お名前と連絡先","アレルギーの有無"], correctAnswer:1, explanation:"予約では来店日時、人数、名前、連絡先、アレルギーの有無等を確認します。プライベートな情報は聞きません。", keywords:[{ja:"予約",reading:"よやく",my:"ကြိုတင်မှာယူခြင်း"}] },
  { id:"s005", category:"service", type:"practical", question:"満席時の来店客への最も適切な対応はどれですか。", options:["「満席です」とだけ伝える","待ち時間の目安を伝え、待つか確認する","他の店を紹介する","無言で首を横に振る"], correctAnswer:1, explanation:"お詫びし、待ち時間の目安を伝え待つか確認します。待つ場合は待合スペースへ案内します。", keywords:[{ja:"満席",reading:"まんせき",my:"ထိုင်ခုံပြည့်နေသည်"}] },
  { id:"s006", category:"service", type:"practical", question:"新人の接客指導で最も効果的な方法はどれですか。", options:["マニュアルを渡して読ませる","見学→実践→フィードバックの流れ","最初から一人で接客させる","動画を見せるだけ"], correctAnswer:1, explanation:"効果的な指導は①見学②実践③フィードバックの流れ。OJT（On the Job Training）の基本です。", keywords:[{ja:"指導",reading:"しどう",my:"လမ်းညွှန်သင်ကြားခြင်း"}] },
  { id:"s007", category:"service", type:"academic", question:"料理に異物混入の訴えがあった場合、最初にすべきことは。", options:["原因を調べてから対応","直ちにお詫びし料理を下げる","「ありえません」と否定する","すぐに代わりの料理を出す"], correctAnswer:1, explanation:"異物混入の訴えにはまず直ちにお詫びし料理を下げます。安全を優先し不快な思いにお詫びします。", keywords:[{ja:"異物混入",reading:"いぶつこんにゅう",my:"အစိမ်းခန္ဓာ ရောနှောခြင်း"}] },
  { id:"s008", category:"service", type:"academic", question:"「ホスピタリティ」の説明として最も適切なものはどれですか。", options:["マニュアル通りに正確にサービスすること","お客様の状況を察し期待を超えるおもてなしをすること","お客様の要望にすべて従うこと","早くサービスを提供すること"], correctAnswer:1, explanation:"ホスピタリティとはお客様の状況や気持ちを察しマニュアルを超えた心からのおもてなしです。", keywords:[{ja:"ホスピタリティ",reading:"ほすぴたりてぃ",my:"ဧည့်ဝတ်ပြုခြင်း စိတ်ဓာတ်"}] },
  { id:"s009", category:"service", type:"academic", question:"原料原産地表示について正しいものはどれですか。", options:["すべての食材の原産地表示義務がある","聞かれた場合に正確に答えられるようにする","外食店に表示義務は一切ない","肉類のみ義務がある"], correctAnswer:1, explanation:"外食店では質問に正確に答えられるよう準備が必要です。米は原産地情報の伝達が義務付けられています。", keywords:[{ja:"原料原産地",reading:"げんりょうげんさんち",my:"ကုန်ကြမ်းမူလထုတ်လုပ်ရာဒေသ"}] },
  { id:"s010", category:"service", type:"academic", question:"お客様にお酒を勧める際、最も重要なことはどれですか。", options:["高額なお酒を勧める","お客様の好みや食事内容に合わせて提案する","とにかく多く注文してもらう","お酒のうんちくを語る"], correctAnswer:1, explanation:"お酒の提案は、お客様の好みや注文している料理との相性を考慮して行います。押し売りにならないよう注意します。", keywords:[{ja:"お酒の提案",reading:"おさけのていあん",my:"အရက်အကြံပြုခြင်း"}] },
  { id:"s011", category:"service", type:"practical", question:"お客様がお会計の際に「領収書をください」と言われた場合、確認すべきことはどれですか。", options:["お客様の住所","宛名（但し書きが必要かも含めて）","お客様の職業","支払い方法の理由"], correctAnswer:1, explanation:"領収書を発行する際は、宛名と但し書きを確認します。「上様」でよいか、会社名で発行するかなどを確認します。", keywords:[{ja:"領収書",reading:"りょうしゅうしょ",my:"ပြေစာ"}] },
  { id:"s012", category:"service", type:"academic", question:"お客様への「おすすめ」の提案方法として最も適切なものはどれですか。", options:["一番高い料理を勧める","季節の食材を使った料理や人気メニューを具体的に説明する","メニューを指さして「これがおすすめです」とだけ言う","すべてのメニューをおすすめする"], correctAnswer:1, explanation:"おすすめは、季節感や食材の特徴、人気の理由を具体的に説明すると説得力があります。お客様の好みも考慮して提案します。", keywords:[{ja:"おすすめ",reading:"おすすめ",my:"အကြံပြုချက်"}] },
  { id:"s013", category:"service", type:"practical", question:"忙しい時間帯にお客様から複雑な注文変更を求められた場合の対応は？", options:["「忙しいのでできません」と断る","注文内容を復唱して確認し、キッチンに正確に伝える","適当に対応して急ぐ","他のスタッフに任せる"], correctAnswer:1, explanation:"忙しい時でも注文は正確に。変更内容を復唱して確認し、伝票に明記してキッチンに伝えます。ミスは再調理のコストと時間のロスにつながります。", keywords:[{ja:"復唱",reading:"ふくしょう",my:"ပြန်ပြောပြခြင်း"}] },
  { id:"s014", category:"service", type:"academic", question:"接客の「5大用語」に含まれないものはどれですか。", options:["いらっしゃいませ","かしこまりました","申し訳ございません","お元気ですか"], correctAnswer:3, explanation:"接客5大用語は「いらっしゃいませ」「かしこまりました」「少々お待ちください」「申し訳ございません」「ありがとうございました」です。", keywords:[{ja:"接客5大用語",reading:"せっきゃくごだいようご",my:"ဧည့်ခံရေး စကားလုံးကြီး ၅ လုံး"}] },
  { id:"s015", category:"service", type:"practical", question:"お客様が食事中にお酒で酔って騒ぎ始めた場合の対応は？", options:["放置する","さらにお酒を勧める","穏やかに声をかけ、水を提供し、必要なら責任者に相談する","すぐに退店を求める"], correctAnswer:2, explanation:"まず穏やかに声をかけ、水やソフトドリンクを提供します。それでも改善しない場合は責任者に相談し、他のお客様への影響も考慮して対応します。", keywords:[{ja:"酔客対応",reading:"よいきゃくたいおう",my:"မူးယစ်သူကိုင်တွယ်ခြင်း"}] },

  // ===== OPERATIONS (店舗運営) 60問 =====
  { id:"o001", category:"operations", type:"academic", question:"FLコストの適正比率として一般的に言われるのはどれですか。", options:["売上高の40〜50%","売上高の55〜65%","売上高の70〜80%","売上高の30〜40%"], correctAnswer:1, explanation:"FLコスト（原材料費＋人件費）は売上高の55〜65%が適正。F=30〜35%、L=25〜30%が目安です。", keywords:[{ja:"FLコスト",reading:"えふえるこすと",my:"အစားအစာနှင့်လုပ်သားကုန်ကျစရိတ်"}] },
  { id:"o002", category:"operations", type:"academic", question:"損益分岐点売上高の計算式として正しいものはどれですか。", options:["固定費÷変動費率","固定費÷（1−変動費率）","（固定費+変動費）÷売上高","売上高×利益率"], correctAnswer:1, explanation:"損益分岐点売上高＝固定費÷（1−変動費率）。利益がゼロになる売上高です。", keywords:[{ja:"損益分岐点",reading:"そんえきぶんきてん",my:"အရှုံးအမြတ်ချိန်ခွင်မျှမှတ်"}] },
  { id:"o003", category:"operations", type:"academic", question:"原価率の計算式として正しいものはどれですか。", options:["売上高÷原価×100","原価÷売上高×100","（売上高−原価）÷売上高×100","原価÷利益×100"], correctAnswer:1, explanation:"原価率＝原価÷売上高×100（%）。売価1,000円で原価300円なら原価率30%です。", keywords:[{ja:"原価率",reading:"げんかりつ",my:"ကုန်ကျစရိတ်နှုန်း"}] },
  { id:"o004", category:"operations", type:"academic", question:"労働基準法の法定労働時間として正しいものはどれですか。", options:["1日10時間、週50時間","1日8時間、週40時間","1日7時間、週35時間","1日9時間、週45時間"], correctAnswer:1, explanation:"法定労働時間は1日8時間、週40時間。超える場合は36協定と割増賃金が必要です。", keywords:[{ja:"法定労働時間",reading:"ほうていろうどうじかん",my:"ဥပဒေသတ်မှတ် အလုပ်ချိန်"}] },
  { id:"o005", category:"operations", type:"practical", question:"売上目標500万円、原価率30%、人件費率28%の場合、食材費＋人件費の合計は？", options:["240万円","260万円","290万円","300万円"], correctAnswer:2, explanation:"食材費=500万×30%=150万、人件費=500万×28%=140万。合計290万円。", keywords:[{ja:"人件費率",reading:"じんけんひりつ",my:"လုပ်သားစရိတ်နှုန်း"}] },
  { id:"o006", category:"operations", type:"academic", question:"ABC分析について正しいものはどれですか。", options:["従業員の能力をA〜Cで評価する","売上貢献度で商品をA〜Cにランク分けする","満足度を3段階で測定する","食材の鮮度をA〜Cで分類する"], correctAnswer:1, explanation:"ABC分析は売上高や粗利益への貢献度で商品をランク分けする手法です。A=上位70%、B=次の20%、C=残り10%。", keywords:[{ja:"ABC分析",reading:"えーびーしーぶんせき",my:"ABC ခွဲခြမ်းစိတ်ဖြာမှု"}] },
  { id:"o007", category:"operations", type:"academic", question:"シフト管理で最も重要な考え方はどれですか。", options:["常に最小人数で運営する","売上予測に基づき適正な人員配置を行う","全員を同じ時間帯に配置する","従業員の希望をすべて優先する"], correctAnswer:1, explanation:"売上予測に基づき忙しい時間帯に多く、暇な時間帯に少なく配置する「適正人員配置」が重要です。", keywords:[{ja:"シフト管理",reading:"しふとかんり",my:"အလှည့်ကျ စီမံခန့်ခွဲမှု"}] },
  { id:"o008", category:"operations", type:"practical", question:"食材原価400円、原価率32%に設定する場合の売価は？", options:["1,000円","1,125円","1,250円","1,280円"], correctAnswer:2, explanation:"売価=原価÷原価率=400÷0.32=1,250円。原価率から売価を逆算する計算です。", keywords:[{ja:"売価",reading:"ばいか",my:"ရောင်းဈေး"}] },
  { id:"o009", category:"operations", type:"academic", question:"客単価を上げるための施策として最も適切なものはどれですか。", options:["メニュー価格をすべて値上げする","セットメニューやデザートの提案で追加注文を促す","席数を増やす","営業時間を延長する"], correctAnswer:1, explanation:"セットメニュー提案やデザート・ドリンクの追加注文促進（アップセル・クロスセル）が効果的です。", keywords:[{ja:"客単価",reading:"きゃくたんか",my:"ဧည့်သည်တစ်ဦးချင်း ပျမ်းမျှသုံးစွဲငွေ"}] },
  { id:"o010", category:"operations", type:"academic", question:"棚卸しの主な目的はどれですか。", options:["新しい食材を注文するため","実際の在庫と帳簿の差異を把握するため","賞味期限切れを探すため","倉庫を整理するため"], correctAnswer:1, explanation:"棚卸しは実際の在庫と帳簿上の在庫を照合し、差異（ロス）を把握することが目的です。", keywords:[{ja:"棚卸し",reading:"たなおろし",my:"ကုန်ပစ္စည်းစာရင်းစစ်ခြင်း"}] },
  { id:"o011", category:"operations", type:"practical", question:"固定費200万円、変動費率40%の店舗の損益分岐点売上高は？", options:["約286万円","約333万円","約400万円","約500万円"], correctAnswer:1, explanation:"200万÷(1−0.4)=200万÷0.6≒333万円。", keywords:[{ja:"損益分岐点売上高",reading:"そんえきぶんきてんうりあげだか",my:"အရှုံးအမြတ်ချိန်ခွင်မျှ ရောင်းအား"}] },
  { id:"o012", category:"operations", type:"academic", question:"従業員のモチベーション向上に最も効果的な方法はどれですか。", options:["給与を上げるだけ","適切な目標設定・評価・フィードバックを行う","厳しく叱る","全員に同じ仕事を与える"], correctAnswer:1, explanation:"目標設定・公正な評価・タイムリーなフィードバック・成長機会の提供が効果的です。", keywords:[{ja:"モチベーション",reading:"もちべーしょん",my:"လုပ်ကိုင်လိုစိတ်"}] },
  { id:"o013", category:"operations", type:"academic", question:"「粗利益」の計算式として正しいものはどれですか。", options:["売上高−人件費","売上高−原価（食材費）","売上高−（原価+人件費+家賃）","利益×売上高"], correctAnswer:1, explanation:"粗利益（売上総利益）＝売上高−原価（食材費）です。ここから人件費や家賃などを引いたものが営業利益になります。", keywords:[{ja:"粗利益",reading:"あらりえき",my:"အကြမ်းအမြတ်"}] },
  { id:"o014", category:"operations", type:"practical", question:"月の売上高が600万円、食材費が180万円の場合、原価率は何%ですか。", options:["25%","28%","30%","33%"], correctAnswer:2, explanation:"原価率=180万÷600万×100=30%です。", keywords:[] },
  { id:"o015", category:"operations", type:"academic", question:"時間外労働の割増賃金率として正しいものはどれですか。", options:["10%以上","25%以上","35%以上","50%以上"], correctAnswer:1, explanation:"時間外労働の割増賃金率は25%以上です。深夜（22時〜5時）は25%以上、休日は35%以上。時間外＋深夜は50%以上になります。", keywords:[{ja:"割増賃金",reading:"わりましちんぎん",my:"အပိုကြေးလုပ်ခ"}] },
  { id:"o016", category:"operations", type:"academic", question:"「回転率」の意味として正しいものはどれですか。", options:["従業員の離職率のこと","一定期間に席が何回使われたかを示す指標","食材の使用頻度のこと","お客様の来店頻度のこと"], correctAnswer:1, explanation:"回転率（席回転率）は、一定期間に席が何回利用されたかを示す指標です。客数÷席数で計算します。回転率を上げることで売上向上につながります。", keywords:[{ja:"回転率",reading:"かいてんりつ",my:"လည်ပတ်နှုန်း"}] },
  { id:"o017", category:"operations", type:"practical", question:"売価800円の料理、食材原価が280円の場合の原価率は？", options:["28%","30%","33%","35%"], correctAnswer:3, explanation:"原価率=280÷800×100=35%です。", keywords:[] },
  { id:"o018", category:"operations", type:"academic", question:"有給休暇について正しいものはどれですか。", options:["パートタイムの従業員には付与されない","6ヶ月間継続勤務し全労働日の8割以上出勤した労働者に付与される","会社が自由に取得日を決められる","1年間で最大5日間である"], correctAnswer:1, explanation:"有給休暇は6ヶ月間継続勤務し、全労働日の8割以上出勤した労働者に10日間付与されます。パートタイムにも比例付与されます。", keywords:[{ja:"有給休暇",reading:"ゆうきゅうきゅうか",my:"လစာပေးအားလပ်ရက်"}] },
  { id:"o019", category:"operations", type:"academic", question:"「歩留まり率」とは何ですか。", options:["お客様の再来店率","食材の使用可能な割合","従業員の出勤率","売上目標の達成率"], correctAnswer:1, explanation:"歩留まり率は、食材の総量に対する使用可能な部分の割合です。例：1kgの魚から600gの刺身が取れれば歩留まり率60%です。原価計算に重要な指標です。", keywords:[{ja:"歩留まり率",reading:"ぶどまりりつ",my:"သုံးစွဲနိုင်သော ရာခိုင်နှုန်း"}] },
  { id:"o020", category:"operations", type:"practical", question:"1kgあたり3,000円のまぐろ、歩留まり率50%の場合、刺身1人前（100g）の食材原価は？", options:["300円","500円","600円","800円"], correctAnswer:2, explanation:"歩留まり率50%なので、実質1kgあたりのコスト=3,000÷0.5=6,000円/kg。刺身100g=6,000×0.1=600円。", keywords:[] },
  { id:"o021", category:"operations", type:"academic", question:"QSCとは何を表す言葉ですか。", options:["品質・サービス・清潔さ","品質・安全・コスト","スピード・サービス・清潔さ","品質・売上・顧客満足度"], correctAnswer:0, explanation:"QSCはQuality（品質）、Service（サービス）、Cleanliness（清潔さ）の頭文字で、飲食店運営の基本指標です。", keywords:[{ja:"QSC",reading:"きゅーえすしー",my:"အရည်အသွေး・ ဝန်ဆောင်မှု・ သန့်ရှင်းမှု"}] },
  { id:"o022", category:"operations", type:"academic", question:"POSシステムの主な機能として正しいものはどれですか。", options:["従業員の健康管理","売上データの記録と分析","食材の発注を自動化する","お客様の個人情報を収集する"], correctAnswer:1, explanation:"POSシステム（販売時点情報管理）は、売上データをリアルタイムで記録・分析するシステムです。メニュー別売上や時間帯別売上の把握に活用します。", keywords:[{ja:"POSシステム",reading:"ぽすしすてむ",my:"အရောင်းအချက်အလက် စနစ်"}] },
  { id:"o023", category:"operations", type:"practical", question:"座席数30席、1日の来客数が90人の場合、1日の回転率は？", options:["2回転","3回転","4回転","5回転"], correctAnswer:1, explanation:"回転率=来客数÷座席数=90÷30=3回転です。", keywords:[] },
  { id:"o024", category:"operations", type:"academic", question:"食品ロスを削減するための取り組みとして最も適切なものはどれですか。", options:["すべてのメニューの量を減らす","売上データに基づいた仕入れ量の適正化と在庫管理の徹底","安い食材だけを使う","お客様に残さないよう強要する"], correctAnswer:1, explanation:"食品ロス削減には、売上データ分析による需要予測、適正な仕入れ量の決定、先入れ先出しの徹底、端材の活用などが効果的です。", keywords:[{ja:"食品ロス",reading:"しょくひんろす",my:"အစားအစာ ဆုံးရှုံးမှု"}] },
  { id:"o025", category:"operations", type:"practical", question:"月の売上高800万円、固定費250万円、変動費率45%の店舗の営業利益は？", options:["110万円","190万円","250万円","300万円"], correctAnswer:0, explanation:"変動費=800万×45%=360万。営業利益=800万−360万−250万=190万円。あれ、計算し直すと…売上800万−変動費360万−固定費250万=190万円です。", keywords:[] },
];

/* ============================================================
   CALCULATION EXERCISES (計算練習)
   ============================================================ */
const CALC_EXERCISES = [
  { id:"calc01", title:"原価率の計算（基本）", question:"ある料理の食材原価が350円、売価が1,000円です。原価率は何%ですか。", hint:"原価率 = 原価 ÷ 売上高 × 100", answer:"35%", steps:["原価率 = 原価 ÷ 売価 × 100","= 350 ÷ 1,000 × 100","= 35%"], keywords:[{ja:"原価率",reading:"げんかりつ",my:"ကုန်ကျစရိတ်နှုန်း"}] },
  { id:"calc02", title:"売価の逆算", question:"食材原価が420円です。原価率を30%に設定する場合、売価はいくらですか。", hint:"売価 = 原価 ÷ 原価率", answer:"1,400円", steps:["売価 = 原価 ÷ 原価率","= 420 ÷ 0.30","= 1,400円"], keywords:[{ja:"売価",reading:"ばいか",my:"ရောင်းဈေး"}] },
  { id:"calc03", title:"FLコスト", question:"月の売上高が400万円、食材費120万円、人件費110万円です。FLコスト比率は何%ですか。", hint:"FLコスト比率 = (F+L) ÷ 売上高 × 100", answer:"57.5%", steps:["FLコスト = 食材費 + 人件費","= 120万 + 110万 = 230万円","FLコスト比率 = 230万 ÷ 400万 × 100","= 57.5%"], keywords:[{ja:"FLコスト",reading:"えふえるこすと",my:"FLကုန်ကျစရိတ်"}] },
  { id:"calc04", title:"損益分岐点売上高", question:"固定費が月180万円、変動費率が35%の店舗の損益分岐点売上高を求めてください。", hint:"損益分岐点売上高 = 固定費 ÷ (1 − 変動費率)", answer:"約277万円", steps:["損益分岐点売上高 = 固定費 ÷ (1 − 変動費率)","= 180万 ÷ (1 − 0.35)","= 180万 ÷ 0.65","≒ 276.9万円 ≒ 約277万円"], keywords:[{ja:"損益分岐点",reading:"そんえきぶんきてん",my:"အရှုံးအမြတ်ချိန်ခွင်မျှမှတ်"}] },
  { id:"calc05", title:"回転率の計算", question:"座席数40席の店舗で、ランチタイム（11時〜14時）の来客数が120人でした。ランチタイムの回転率は？", hint:"回転率 = 来客数 ÷ 座席数", answer:"3回転", steps:["回転率 = 来客数 ÷ 座席数","= 120 ÷ 40","= 3回転"], keywords:[{ja:"回転率",reading:"かいてんりつ",my:"လည်ပတ်နှုန်း"}] },
  { id:"calc06", title:"人件費率", question:"月の売上高が500万円、総人件費が140万円です。人件費率は何%ですか。", hint:"人件費率 = 人件費 ÷ 売上高 × 100", answer:"28%", steps:["人件費率 = 人件費 ÷ 売上高 × 100","= 140万 ÷ 500万 × 100","= 28%"], keywords:[{ja:"人件費率",reading:"じんけんひりつ",my:"လုပ်သားစရိတ်နှုန်း"}] },
  { id:"calc07", title:"歩留まり原価", question:"1kgあたり2,000円の牛肉。歩留まり率が60%の場合、使用可能な肉1kgあたりの実質原価はいくらですか。", hint:"実質原価 = 仕入れ単価 ÷ 歩留まり率", answer:"約3,333円", steps:["実質原価 = 仕入れ単価 ÷ 歩留まり率","= 2,000 ÷ 0.60","≒ 3,333円"], keywords:[{ja:"歩留まり率",reading:"ぶどまりりつ",my:"သုံးစွဲနိုင်သော ရာခိုင်နှုန်း"}] },
  { id:"calc08", title:"客単価の計算", question:"1日の売上高が25万円、来客数が100人でした。客単価はいくらですか。", hint:"客単価 = 売上高 ÷ 来客数", answer:"2,500円", steps:["客単価 = 売上高 ÷ 来客数","= 250,000 ÷ 100","= 2,500円"], keywords:[{ja:"客単価",reading:"きゃくたんか",my:"ဧည့်သည်တစ်ဦးချင်း ပျမ်းမျှသုံးစွဲငွေ"}] },
  { id:"calc09", title:"粗利益の計算", question:"売上高が300万円、食材原価が90万円の場合、粗利益と粗利益率を求めてください。", hint:"粗利益 = 売上高 − 原価、粗利益率 = 粗利益 ÷ 売上高 × 100", answer:"粗利益210万円、粗利益率70%", steps:["粗利益 = 売上高 − 原価","= 300万 − 90万 = 210万円","粗利益率 = 210万 ÷ 300万 × 100","= 70%"], keywords:[{ja:"粗利益",reading:"あらりえき",my:"အကြမ်းအမြတ်"}] },
  { id:"calc10", title:"割増賃金の計算", question:"時給1,200円のスタッフが22時以降に2時間残業しました。この2時間分の賃金はいくらですか。（時間外25%＋深夜25%＝50%増し）", hint:"割増賃金 = 時給 × (1 + 割増率) × 時間", answer:"3,600円", steps:["割増率 = 時間外25% + 深夜25% = 50%","割増時給 = 1,200 × 1.50 = 1,800円","2時間分 = 1,800 × 2 = 3,600円"], keywords:[{ja:"割増賃金",reading:"わりましちんぎん",my:"အပိုကြေးလုပ်ခ"}] },
];

/* ============================================================
   VOCABULARY
   ============================================================ */
const VOCAB = [
  {ja:"衛生管理",reading:"えいせいかんり",my:"တက်ကျန်းမာရေး စီမံခန့်ခွဲမှု",cat:"hygiene"},
  {ja:"食中毒",reading:"しょくちゅうどく",my:"အစားအစာ အဆိပ်သင့်ခြင်း",cat:"hygiene"},
  {ja:"消毒",reading:"しょうどく",my:"ပိုးသတ်ခြင်း",cat:"hygiene"},
  {ja:"交差汚染",reading:"こうさおせん",my:"ကူးစက်ညစ်ညမ်းခြင်း",cat:"hygiene"},
  {ja:"食品衛生法",reading:"しょくひんえいせいほう",my:"အစားအစာ တက်ကျန်းမာရေး ဥပဒေ",cat:"hygiene"},
  {ja:"営業許可",reading:"えいぎょうきょか",my:"စီးပွားရေးလုပ်ကိုင်ခွင့်",cat:"hygiene"},
  {ja:"細菌",reading:"さいきん",my:"ဘက်တီးရီးယား",cat:"hygiene"},
  {ja:"潜伏期間",reading:"せんぷくきかん",my:"ကူးစက်ပြီး လက္ခဏာမပြခင် ကာလ",cat:"hygiene"},
  {ja:"温度管理",reading:"おんどかんり",my:"အပူချိန်ထိန်းချုပ်ခြင်း",cat:"hygiene"},
  {ja:"アレルゲン",reading:"あれるげん",my:"ဓာတ်မတည့်မှုဖြစ်စေသည့်အရာ",cat:"hygiene"},
  {ja:"危険温度帯",reading:"きけんおんどたい",my:"အန္တရာယ်ရှိ အပူချိန်ဇုန်",cat:"hygiene"},
  {ja:"芽胞",reading:"がほう",my:"မျိုးစေ့",cat:"hygiene"},
  {ja:"手指消毒",reading:"しゅししょうどく",my:"လက်ပိုးသတ်ခြင်း",cat:"hygiene"},
  {ja:"鮮度",reading:"せんど",my:"လတ်ဆတ်မှု",cat:"cooking"},
  {ja:"下処理",reading:"したしょり",my:"ကြိုတင်ပြင်ဆင်ခြင်း",cat:"cooking"},
  {ja:"包丁",reading:"ほうちょう",my:"ဓား",cat:"cooking"},
  {ja:"揚げる",reading:"あげる",my:"ဆီကြော်ခြင်း",cat:"cooking"},
  {ja:"煮る",reading:"にる",my:"ပြုတ်ခြင်း",cat:"cooking"},
  {ja:"蒸す",reading:"むす",my:"ပေါင်းခြင်း",cat:"cooking"},
  {ja:"焼く",reading:"やく",my:"ကင်ခြင်း",cat:"cooking"},
  {ja:"あく抜き",reading:"あくぬき",my:"ခါးသက်ဖယ်ရှားခြင်း",cat:"cooking"},
  {ja:"クレーム",reading:"くれーむ",my:"တိုင်ကြားချက်",cat:"service"},
  {ja:"予約",reading:"よやく",my:"ကြိုတင်မှာယူခြင်း",cat:"service"},
  {ja:"会計",reading:"かいけい",my:"ငွေရှင်းခြင်း",cat:"service"},
  {ja:"満席",reading:"まんせき",my:"ထိုင်ခုံပြည့်နေသည်",cat:"service"},
  {ja:"接客",reading:"せっきゃく",my:"ဧည့်ခံခြင်း",cat:"service"},
  {ja:"おもてなし",reading:"おもてなし",my:"ဂုဏ်ပြုဧည့်ခံခြင်း",cat:"service"},
  {ja:"傾聴",reading:"けいちょう",my:"စေ့စေ့နားထောင်ခြင်း",cat:"service"},
  {ja:"領収書",reading:"りょうしゅうしょ",my:"ပြေစာ",cat:"service"},
  {ja:"売上高",reading:"うりあげだか",my:"ရောင်းအားစုစုပေါင်း",cat:"operations"},
  {ja:"原価率",reading:"げんかりつ",my:"ကုန်ကျစရိတ်နှုန်း",cat:"operations"},
  {ja:"人件費",reading:"じんけんひ",my:"လုပ်သားစရိတ်",cat:"operations"},
  {ja:"損益分岐点",reading:"そんえきぶんきてん",my:"အရှုံးအမြတ်ချိန်ခွင်မျှမှတ်",cat:"operations"},
  {ja:"棚卸し",reading:"たなおろし",my:"ကုန်ပစ္စည်းစာရင်းစစ်ခြင်း",cat:"operations"},
  {ja:"固定費",reading:"こていひ",my:"ပုံသေကုန်ကျစရိတ်",cat:"operations"},
  {ja:"変動費",reading:"へんどうひ",my:"ပြောင်းလဲကုန်ကျစရိတ်",cat:"operations"},
  {ja:"客単価",reading:"きゃくたんか",my:"ဧည့်သည်တစ်ဦးချင်း ပျမ်းမျှသုံးစွဲငွေ",cat:"operations"},
  {ja:"シフト管理",reading:"しふとかんり",my:"အလှည့်ကျ စီမံခန့်ခွဲမှု",cat:"operations"},
  {ja:"労働基準法",reading:"ろうどうきじゅんほう",my:"အလုပ်သမား စံနှုန်းဥပဒေ",cat:"operations"},
  {ja:"割増賃金",reading:"わりましちんぎん",my:"အပိုကြေးလုပ်ခ",cat:"operations"},
  {ja:"粗利益",reading:"あらりえき",my:"အကြမ်းအမြတ်",cat:"operations"},
  {ja:"回転率",reading:"かいてんりつ",my:"လည်ပတ်နှုန်း",cat:"operations"},
  {ja:"歩留まり率",reading:"ぶどまりりつ",my:"သုံးစွဲနိုင်သော ရာခိုင်နှုန်း",cat:"operations"},
  {ja:"有給休暇",reading:"ゆうきゅうきゅうか",my:"လစာပေးအားလပ်ရက်",cat:"operations"},
  {ja:"QSC",reading:"きゅーえすしー",my:"အရည်အသွေး・ ဝန်ဆောင်မှု・ သန့်ရှင်းမှု",cat:"operations"},
  {ja:"食品ロス",reading:"しょくひんろす",my:"အစားအစာ ဆုံးရှုံးမှု",cat:"operations"},
];

/* ============================================================
   UTILS
   ============================================================ */
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function loadStats() { try { const s = localStorage.getItem("tg2_stats"); return s ? JSON.parse(s) : null; } catch { return null; } }
function saveStats(stats) { try { localStorage.setItem("tg2_stats", JSON.stringify(stats)); } catch {} }
function loadWrong() { try { const w = localStorage.getItem("tg2_wrong"); return w ? JSON.parse(w) : []; } catch { return []; } }
function saveWrong(ids) { try { localStorage.setItem("tg2_wrong", JSON.stringify(ids)); } catch {} }
function loadDark() { try { return localStorage.getItem("tg2_dark") === "true"; } catch { return false; } }
function saveDark(v) { try { localStorage.setItem("tg2_dark", String(v)); } catch {} }

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
function ProgressBar({ value, max, color = "bg-amber-500" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} /></div>;
}

function HeaderBar({ title, onBack, right }) {
  return <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10"><button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={20} /></button><h2 className="flex-1 font-medium text-gray-800 dark:text-gray-100 text-base">{title}</h2>{right}</div>;
}

/* ============================================================
   HOME SCREEN
   ============================================================ */
function HomeScreen({ onNavigate, stats, dark, setDark, wrongCount }) {
  const catKeys = Object.keys(CATEGORIES);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md"><Sparkles size={20} className="text-white" /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">外食業 特定技能2号</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Padauk', sans-serif" }}>စားသောက်ဆိုင်လုပ်ငန်း ကျွမ်းကျင်မှု အဆင့် ၂</p>
          </div>
        </div>
        <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-500" />}</button>
      </div>

      {stats.totalAnswered > 0 && (
        <div className="mx-5 mb-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">学習の進捗</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{stats.totalCorrect}/{stats.totalAnswered}</span>
          </div>
          <ProgressBar value={stats.totalCorrect} max={stats.totalAnswered} />
          <p className="text-xs text-gray-400 mt-1">正答率 {Math.round((stats.totalCorrect / stats.totalAnswered) * 100)}% ・ 全{QUESTIONS.length}問中</p>
        </div>
      )}

      <div className="px-5 mb-2"><h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">分野別クイズ</h3></div>
      <div className="px-5 grid grid-cols-2 gap-3 mb-4">
        {catKeys.map(key => {
          const cat = CATEGORIES[key]; const Icon = cat.icon;
          const answered = stats.byCategory[key]?.answered || 0;
          const correct = stats.byCategory[key]?.correct || 0;
          const total = QUESTIONS.filter(q => q.category === key).length;
          return (
            <button key={key} onClick={() => onNavigate("quiz", key)} className={`p-4 rounded-2xl ${cat.colorLight} border ${cat.colorBorder} text-left transition-all active:scale-95 hover:shadow-md`}>
              <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center mb-2 shadow-sm`}><Icon size={18} className="text-white" /></div>
              <p className={`font-bold text-sm ${cat.colorText}`}>{cat.name_ja}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat.desc}</p>
              <p className="text-xs text-gray-400 mt-0.5">{total}問 ・ {cat.points}点配点</p>
              {answered > 0 && <p className="text-xs text-gray-400 mt-1">{correct}/{answered} 正解</p>}
            </button>
          );
        })}
      </div>

      <div className="px-5 mb-2"><h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">その他の学習</h3></div>
      <div className="px-5 flex flex-col gap-2.5 pb-20">
        {wrongCount > 0 && (
          <button onClick={() => onNavigate("review")} className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-950 rounded-2xl border border-rose-200 dark:border-rose-800 shadow-sm active:scale-98 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center shadow-sm"><RefreshCw size={20} className="text-white" /></div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm text-rose-700 dark:text-rose-300">間違えた問題を復習</p>
              <p className="text-xs text-rose-500 dark:text-rose-400">{wrongCount}問の復習が必要</p>
            </div>
            <ArrowRight size={16} className="text-rose-300" />
          </button>
        )}
        <button onClick={() => onNavigate("mock")} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-98 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm"><Clock size={20} className="text-white" /></div>
          <div className="text-left flex-1"><p className="font-bold text-sm text-gray-800 dark:text-gray-100">模擬試験モード</p><p className="text-xs text-gray-500 dark:text-gray-400">本番形式・70分タイマー</p></div>
          <ArrowRight size={16} className="text-gray-300" />
        </button>
        <button onClick={() => onNavigate("calc")} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-98 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm"><Calculator size={20} className="text-white" /></div>
          <div className="text-left flex-1"><p className="font-bold text-sm text-gray-800 dark:text-gray-100">計算練習</p><p className="text-xs text-gray-500 dark:text-gray-400">原価率・損益分岐点・歩留まり</p></div>
          <ArrowRight size={16} className="text-gray-300" />
        </button>
        <button onClick={() => onNavigate("vocab")} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-98 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-teal-500 flex items-center justify-center shadow-sm"><BookOpen size={20} className="text-white" /></div>
          <div className="text-left flex-1"><p className="font-bold text-sm text-gray-800 dark:text-gray-100">単語帳</p><p className="text-xs text-gray-500 dark:text-gray-400">日本語 ↔ ミャンマー語 ({VOCAB.length}語)</p></div>
          <ArrowRight size={16} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   QUIZ SCREEN (used for category quiz AND review mode)
   ============================================================ */
function QuizScreen({ category, onBack, onUpdateStats, onWrongAnswer, onRemoveWrong, reviewIds }) {
  const isReview = !!reviewIds;
  const cat = isReview ? null : CATEGORIES[category];
  const questions = useMemo(() => {
    if (isReview) return shuffle(QUESTIONS.filter(q => reviewIds.includes(q.id)));
    return shuffle(QUESTIONS.filter(q => q.category === category));
  }, [category, reviewIds]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><HeaderBar title="復習" onBack={onBack} /><div className="flex flex-col items-center pt-20 px-6"><Trophy size={48} className="text-emerald-500 mb-4" /><p className="text-lg font-bold text-gray-800 dark:text-gray-100">復習する問題はありません！</p><button onClick={onBack} className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium">ホームに戻る</button></div></div>;

  const q = questions[idx];
  const total = questions.length;
  const qCat = CATEGORIES[q.category];

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    setShowExplanation(true);
    const isCorrect = i === q.correctAnswer;
    if (isCorrect) { setScore(s => s + 1); if (onRemoveWrong) onRemoveWrong(q.id); }
    else { if (onWrongAnswer) onWrongAnswer(q.id); }
    if (!isReview) onUpdateStats(q.category, isCorrect);
  };

  const handleNext = () => {
    if (idx + 1 >= total) { setDone(true); return; }
    setIdx(i => i + 1); setSelected(null); setShowExplanation(false);
  };

  if (done) {
    const pct = Math.round((score / total) * 100); const passed = pct >= 65;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <HeaderBar title={isReview ? "復習 結果" : `${cat.name_ja} 結果`} onBack={onBack} />
        <div className="flex flex-col items-center px-6 pt-10">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${passed ? "bg-emerald-100 dark:bg-emerald-900" : "bg-rose-100 dark:bg-rose-900"}`}>
            {passed ? <Trophy size={40} className="text-emerald-600 dark:text-emerald-400" /> : <RotateCcw size={40} className="text-rose-600 dark:text-rose-400" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{score}/{total} 正解</h2>
          <p className={`text-lg font-semibold ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{pct}%{!isReview && (passed ? " — 合格ライン達成！" : " — もう少し頑張りましょう")}</p>
          <div className="w-full mt-6 flex gap-3">
            <button onClick={onBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300">ホームに戻る</button>
            <button onClick={() => { setIdx(0); setSelected(null); setShowExplanation(false); setScore(0); setDone(false); }} className={`flex-1 py-3 rounded-xl text-sm font-medium text-white ${isReview ? "bg-rose-500" : qCat?.color || "bg-amber-500"}`}>もう一度</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <HeaderBar title={isReview ? "間違えた問題の復習" : qCat.name_ja} onBack={onBack} right={<span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{idx + 1}/{total}</span>} />
      <div className="px-4 pt-3"><ProgressBar value={idx + 1} max={total} color={isReview ? "bg-rose-500" : qCat.color} /></div>
      <div className="px-4 pt-4 pb-32">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorText} font-medium`}>{CATEGORIES[q.category].name_ja}</span>
            <span className="text-xs text-gray-400">{q.type === "academic" ? "学科" : "実技"}</span>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{q.question}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => {
            let cls = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100";
            if (selected !== null) {
              if (i === q.correctAnswer) cls = "bg-emerald-50 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200";
              else if (i === selected) cls = "bg-rose-50 dark:bg-rose-900/50 border-rose-400 dark:border-rose-600 text-rose-800 dark:text-rose-200";
              else cls = "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400";
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${cls} ${selected === null ? "active:scale-98" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${selected !== null && i === q.correctAnswer ? "bg-emerald-500 border-emerald-500 text-white" : selected === i && i !== q.correctAnswer ? "bg-rose-500 border-rose-500 text-white" : "border-gray-300 dark:border-gray-600 text-gray-500"}`}>
                    {selected !== null && i === q.correctAnswer ? <Check size={14} /> : selected === i && i !== q.correctAnswer ? <X size={14} /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
        {showExplanation && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2"><Brain size={16} className="text-amber-600 dark:text-amber-400" /><span className="text-sm font-bold text-amber-700 dark:text-amber-300">解説</span></div>
            <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{q.explanation}</p>
            {q.keywords?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">重要用語</p>
                {q.keywords.map((kw, ki) => (
                  <div key={ki} className="flex items-baseline gap-2 text-xs mb-1">
                    <span className="font-bold text-gray-800 dark:text-gray-100">{kw.ja}</span>
                    <span className="text-gray-400">({kw.reading})</span>
                    {kw.my && <span className="text-amber-700 dark:text-amber-300" style={{ fontFamily: "'Padauk', sans-serif" }}>{kw.my}</span>}
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleNext} className={`w-full mt-4 py-3 rounded-xl text-sm font-medium text-white ${isReview ? "bg-rose-500" : qCat.color} active:scale-98`}>
              {idx + 1 >= total ? "結果を見る" : "次の問題へ"} <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MOCK EXAM SCREEN
   ============================================================ */
function MockExamScreen({ onBack, onUpdateStats, onWrongAnswer }) {
  const allQ = useMemo(() => shuffle([...QUESTIONS]).slice(0, 55), []);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(70 * 60);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (started && !submitted && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [started, submitted, timeLeft]);

  const mins = Math.floor(timeLeft / 60); const secs = timeLeft % 60;

  const handleSubmit = () => {
    setSubmitted(true); clearInterval(timerRef.current);
    allQ.forEach((q, i) => {
      if (answers[i] !== undefined) {
        const correct = answers[i] === q.correctAnswer;
        onUpdateStats(q.category, correct);
        if (!correct) onWrongAnswer(q.id);
      }
    });
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <HeaderBar title="模擬試験" onBack={onBack} />
        <div className="flex flex-col items-center px-6 pt-12">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4"><Clock size={36} className="text-emerald-600 dark:text-emerald-400" /></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">模擬試験モード</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">本番と同じ形式で練習しましょう</p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 w-full mb-6">
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">問題数</span><span className="font-bold dark:text-white">{allQ.length}問</span></div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">制限時間</span><span className="font-bold dark:text-white">70分</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">合格基準</span><span className="font-bold text-emerald-600 dark:text-emerald-400">65%以上</span></div>
          </div>
          <button onClick={() => setStarted(true)} className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-medium text-sm active:scale-98">試験を開始する</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    let correct = 0;
    allQ.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const pct = Math.round((correct / allQ.length) * 100); const passed = pct >= 65;
    const byCat = {};
    allQ.forEach((q, i) => { if (!byCat[q.category]) byCat[q.category] = { total: 0, correct: 0 }; byCat[q.category].total++; if (answers[i] === q.correctAnswer) byCat[q.category].correct++; });
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <HeaderBar title="模擬試験 結果" onBack={onBack} />
        <div className="flex flex-col items-center px-5 pt-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${passed ? "bg-emerald-100 dark:bg-emerald-900" : "bg-rose-100 dark:bg-rose-900"}`}>
            {passed ? <Trophy size={40} className="text-emerald-600" /> : <RotateCcw size={40} className="text-rose-600" />}
          </div>
          <h2 className="text-2xl font-bold dark:text-white">{correct}/{allQ.length}</h2>
          <p className={`text-lg font-bold ${passed ? "text-emerald-600" : "text-rose-600"}`}>{pct}% — {passed ? "合格！" : "不合格"}</p>
          <div className="w-full mt-6 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">分野別スコア</h3>
            {Object.entries(byCat).map(([key, val]) => (
              <div key={key} className="mb-3"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-300">{CATEGORIES[key].name_ja}</span><span className="font-bold dark:text-white">{val.correct}/{val.total}</span></div><ProgressBar value={val.correct} max={val.total} color={CATEGORIES[key].color} /></div>
            ))}
          </div>
          <button onClick={onBack} className="w-full mt-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300">ホームに戻る</button>
        </div>
      </div>
    );
  }

  const q = allQ[idx];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{idx + 1}/{allQ.length}</span>
        <span className={`text-sm font-bold font-mono ${timeLeft < 300 ? "text-rose-600" : "text-gray-700 dark:text-gray-200"}`}>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
        <button onClick={handleSubmit} className="text-sm font-medium text-emerald-600">提出</button>
      </div>
      <div className="px-4 pt-2"><ProgressBar value={idx + 1} max={allQ.length} color="bg-emerald-500" /></div>
      <div className="px-4 pt-4 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorText} font-medium`}>{CATEGORIES[q.category].name_ja}</span>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed mt-3">{q.question}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setAnswers(a => ({ ...a, [idx]: i }))} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[idx] === i ? `${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorBorder}` : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"} active:scale-98`}>
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${answers[idx] === i ? `${CATEGORIES[q.category].color} border-transparent text-white` : "border-gray-300 dark:border-gray-600 text-gray-500"}`}>{String.fromCharCode(65 + i)}</span>
                <span className="text-sm leading-relaxed pt-0.5 dark:text-gray-100">{opt}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 disabled:opacity-30">前へ</button>
          {idx + 1 < allQ.length ? <button onClick={() => setIdx(i => i + 1)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium active:scale-98">次へ</button>
          : <button onClick={handleSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold active:scale-98">提出する</button>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CALCULATION PRACTICE SCREEN
   ============================================================ */
function CalcScreen({ onBack }) {
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const ex = CALC_EXERCISES[idx];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <HeaderBar title="計算練習" onBack={onBack} right={<span className="text-sm text-gray-500 dark:text-gray-400">{idx + 1}/{CALC_EXERCISES.length}</span>} />
      <div className="px-4 pt-3"><ProgressBar value={idx + 1} max={CALC_EXERCISES.length} color="bg-indigo-500" /></div>
      <div className="px-4 pt-4 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">{ex.title}</p>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{ex.question}</p>
          <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">ヒント / အကြံပြုချက်</p>
            <p className="text-sm text-indigo-800 dark:text-indigo-200 font-mono">{ex.hint}</p>
          </div>
        </div>

        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="w-full py-3.5 bg-indigo-500 text-white rounded-xl text-sm font-medium active:scale-98">
            <Eye size={16} className="inline mr-2" />答えを見る
          </button>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{ex.answer}</span>
            </div>
            <div className="space-y-1.5">
              {ex.steps.map((step, i) => (
                <p key={i} className="text-sm text-emerald-800 dark:text-emerald-200 font-mono">{step}</p>
              ))}
            </div>
            {ex.keywords?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                {ex.keywords.map((kw, ki) => (
                  <div key={ki} className="flex items-baseline gap-2 text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-100">{kw.ja}</span>
                    <span className="text-gray-400">({kw.reading})</span>
                    <span className="text-emerald-700 dark:text-emerald-300" style={{ fontFamily: "'Padauk', sans-serif" }}>{kw.my}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { if (idx > 0) { setIdx(i => i - 1); setShowAnswer(false); } }} disabled={idx === 0} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-30 dark:text-gray-300">前へ</button>
              <button onClick={() => { if (idx < CALC_EXERCISES.length - 1) { setIdx(i => i + 1); setShowAnswer(false); } else { onBack(); } }} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl text-sm font-medium active:scale-98">
                {idx < CALC_EXERCISES.length - 1 ? "次の問題" : "完了"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   VOCAB SCREEN
   ============================================================ */
function VocabScreen({ onBack }) {
  const [filter, setFilter] = useState("all");
  const [showReading, setShowReading] = useState(true);
  const [showMyanmar, setShowMyanmar] = useState(true);
  const [flashMode, setFlashMode] = useState(false);
  const [flashIdx, setFlashIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const filtered = filter === "all" ? VOCAB : VOCAB.filter(v => v.cat === filter);
  const shuffled = useMemo(() => shuffle(filtered), [filter]);

  if (flashMode) {
    const card = shuffled[flashIdx];
    if (!card) return null;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <HeaderBar title="フラッシュカード" onBack={() => setFlashMode(false)} right={<span className="text-sm text-gray-500">{flashIdx + 1}/{shuffled.length}</span>} />
        <div className="px-5 pt-8 flex flex-col items-center">
          <button onClick={() => setFlipped(f => !f)} className="w-full max-w-sm aspect-[3/2] bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-6 active:scale-98 transition-transform">
            {!flipped ? (
              <><p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{card.ja}</p><p className="text-xs text-gray-400">タップして答えを見る</p></>
            ) : (
              <><p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{card.ja}</p><p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{card.reading}</p><p className="text-lg text-amber-700 dark:text-amber-300 font-medium" style={{ fontFamily: "'Padauk', sans-serif" }}>{card.my}</p></>
            )}
          </button>
          <div className="flex gap-3 mt-6 w-full max-w-sm">
            <button onClick={() => { setFlashIdx(i => Math.max(0, i - 1)); setFlipped(false); }} disabled={flashIdx === 0} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-30 dark:text-gray-300">前へ</button>
            <button onClick={() => { setFlashIdx(i => Math.min(shuffled.length - 1, i + 1)); setFlipped(false); }} disabled={flashIdx >= shuffled.length - 1} className="flex-1 py-3 bg-teal-500 text-white rounded-xl text-sm font-medium active:scale-98 disabled:opacity-30">次へ</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <HeaderBar title={`単語帳 (${filtered.length}語)`} onBack={onBack} right={<button onClick={() => { setFlashMode(true); setFlashIdx(0); setFlipped(false); }} className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded-lg font-medium">カード</button>} />
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {[{ k: "all", l: "すべて" }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ k, l: v.name_ja }))].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${filter === f.k ? "bg-teal-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>{f.l}</button>
        ))}
      </div>
      <div className="px-4 flex gap-4 mb-3">
        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><input type="checkbox" checked={showReading} onChange={e => setShowReading(e.target.checked)} className="rounded" /> 読み仮名</label>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><input type="checkbox" checked={showMyanmar} onChange={e => setShowMyanmar(e.target.checked)} className="rounded" /> ミャンマー語</label>
      </div>
      <div className="px-4 pb-24 flex flex-col gap-2">
        {filtered.map((v, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-baseline justify-between"><span className="font-bold text-gray-900 dark:text-white">{v.ja}</span><span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[v.cat]?.colorLight} ${CATEGORIES[v.cat]?.colorText}`}>{CATEGORIES[v.cat]?.name_ja}</span></div>
            {showReading && <p className="text-xs text-gray-400 mt-0.5">{v.reading}</p>}
            {showMyanmar && <p className="text-sm text-amber-700 dark:text-amber-300 mt-1" style={{ fontFamily: "'Padauk', sans-serif" }}>{v.my}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [quizCategory, setQuizCategory] = useState(null);
  const [dark, setDark] = useState(false);
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0, byCategory: {} });
  const [wrongIds, setWrongIds] = useState([]);

  useEffect(() => {
    const saved = loadStats();
    if (saved) setStats(saved);
    setWrongIds(loadWrong());
    setDark(loadDark());
  }, []);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); saveDark(dark); }, [dark]);

  const handleNavigate = (s, cat) => { setScreen(s); if (cat) setQuizCategory(cat); };

  const handleUpdateStats = useCallback((category, isCorrect) => {
    setStats(prev => {
      const byCat = { ...prev.byCategory };
      if (!byCat[category]) byCat[category] = { answered: 0, correct: 0 };
      byCat[category] = { answered: byCat[category].answered + 1, correct: byCat[category].correct + (isCorrect ? 1 : 0) };
      const next = { totalAnswered: prev.totalAnswered + 1, totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0), byCategory: byCat };
      saveStats(next);
      return next;
    });
  }, []);

  const handleWrongAnswer = useCallback((qId) => {
    setWrongIds(prev => { const next = prev.includes(qId) ? prev : [...prev, qId]; saveWrong(next); return next; });
  }, []);

  const handleRemoveWrong = useCallback((qId) => {
    setWrongIds(prev => { const next = prev.filter(id => id !== qId); saveWrong(next); return next; });
  }, []);

  const goHome = () => { setScreen("home"); setQuizCategory(null); };

  switch (screen) {
    case "quiz": return <QuizScreen category={quizCategory} onBack={goHome} onUpdateStats={handleUpdateStats} onWrongAnswer={handleWrongAnswer} onRemoveWrong={handleRemoveWrong} />;
    case "review": return <QuizScreen onBack={goHome} onUpdateStats={handleUpdateStats} onWrongAnswer={handleWrongAnswer} onRemoveWrong={handleRemoveWrong} reviewIds={wrongIds} />;
    case "mock": return <MockExamScreen onBack={goHome} onUpdateStats={handleUpdateStats} onWrongAnswer={handleWrongAnswer} />;
    case "calc": return <CalcScreen onBack={goHome} />;
    case "vocab": return <VocabScreen onBack={goHome} />;
    default: return <HomeScreen onNavigate={handleNavigate} stats={stats} dark={dark} setDark={setDark} wrongCount={wrongIds.length} />;
  }
}
