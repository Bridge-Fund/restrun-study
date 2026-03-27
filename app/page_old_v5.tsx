// @ts-nocheck
"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Shield, ChefHat, Users, Store, ArrowLeft, ArrowRight, Check, X, BookOpen, Trophy, Clock, RotateCcw, Brain, Sparkles, Eye, EyeOff, Calculator, Moon, Sun, RefreshCw, ChevronRight, Flame, BarChart3, CheckCircle2, Circle, Award, LogOut } from "lucide-react";
import { auth, provider, isConfigured } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getUserProfile, setUserProfile, getFacility, createFacility, syncLearnerStats } from "./firestore";

/* ──────── CSS for overlay animation (injected once) ──────── */
function InjectStyles() {
  useEffect(() => {
    if (document.getElementById("tg2-styles")) return;
    const style = document.createElement("style");
    style.id = "tg2-styles";
    style.textContent = `
      @keyframes tg2-pop { 0%{transform:scale(0.3);opacity:0} 50%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }
      @keyframes tg2-fadeout { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
      .tg2-overlay { animation: tg2-fadeout 0.8s ease-in-out forwards; }
      .tg2-symbol  { animation: tg2-pop 0.35s ease-out forwards; }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

/* ──────── CATEGORIES ──────── */
const CATEGORIES = {
  hygiene:    { name_ja:"衛生管理",  name_my:"တက်ကျန်းမာရေး စီမံခန့်ခွဲမှု", icon:Shield,  color:"bg-rose-500",   colorLight:"bg-rose-50 dark:bg-rose-950",     colorText:"text-rose-700 dark:text-rose-300",     colorBorder:"border-rose-200 dark:border-rose-800",     points:40, desc:"HACCP・食中毒菌・消毒" },
  cooking:    { name_ja:"飲食物調理",name_my:"အစားအစာ ချက်ပြုတ်ခြင်း",        icon:ChefHat, color:"bg-amber-500",  colorLight:"bg-amber-50 dark:bg-amber-950",   colorText:"text-amber-700 dark:text-amber-300",   colorBorder:"border-amber-200 dark:border-amber-800",   points:10, desc:"食材・調理法・器具" },
  service:    { name_ja:"接客全般",  name_my:"ဧည့်ခံခြင်း အထွေထွေ",           icon:Users,   color:"bg-sky-500",    colorLight:"bg-sky-50 dark:bg-sky-950",       colorText:"text-sky-700 dark:text-sky-300",       colorBorder:"border-sky-200 dark:border-sky-800",       points:30, desc:"クレーム・アレルギー・お酒" },
  operations: { name_ja:"店舗運営",  name_my:"ဆိုင်ခွဲ စီမံခန့်ခွဲမှု",       icon:Store,   color:"bg-violet-500", colorLight:"bg-violet-50 dark:bg-violet-950", colorText:"text-violet-700 dark:text-violet-300", colorBorder:"border-violet-200 dark:border-violet-800", points:40, desc:"原価率・損益分岐点・シフト" },
};

const PASS_LINE = 65;

/* ──────── QUESTIONS ──────── */
const QUESTIONS=[
  {id:"h001",category:"hygiene",type:"academic",question:"HACCPの7原則に含まれないものはどれですか。",options:["危害要因分析","重要管理点の決定","従業員の健康診断の実施","モニタリング方法の設定"],correctAnswer:2,explanation:"HACCPの7原則は、①危害要因分析、②重要管理点（CCP）の決定、③管理基準の設定、④モニタリング方法の設定、⑤改善措置の設定、⑥検証方法の設定、⑦記録の保持です。",keywords:[{ja:"危害要因分析",reading:"きがいよういんぶんせき",my:"အန္တရာယ်ဖြစ်စေသော အချက်များ ခွဲခြမ်းစိတ်ဖြာခြင်း"},{ja:"重要管理点",reading:"じゅうようかんりてん",my:"အရေးကြီးသော ထိန်းချုပ်မှတ်"}]},
  {id:"h002",category:"hygiene",type:"academic",question:"ノロウイルスによる食中毒の予防として、最も適切なものはどれですか。",options:["食品の中心温度を65℃で1分間加熱する","食品の中心温度を85〜90℃で90秒間以上加熱する","食品を冷蔵庫で10℃以下に保管する","調理前に食品を流水で30秒間洗う"],correctAnswer:1,explanation:"ノロウイルスは熱に比較的強いため、中心温度85〜90℃で90秒間以上の加熱が必要です。",keywords:[{ja:"ノロウイルス",reading:"のろういるす",my:"နိုရိုဗိုင်းရပ်စ်"},{ja:"中心温度",reading:"ちゅうしんおんど",my:"ဗဟိုအပူချိန်"}]},
  {id:"h003",category:"hygiene",type:"academic",question:"次亜塩素酸ナトリウムによる消毒で正しいものはどれですか。",options:["金属製の調理器具の消毒に最も適している","野菜の消毒には100ppmの濃度で使用する","ノロウイルスの消毒には200ppm以上の濃度が必要である","使用後は水で洗い流す必要はない"],correctAnswer:2,explanation:"ノロウイルスの消毒には200ppm以上（嘔吐物は1000ppm以上）が必要です。金属には腐食性があり不向きです。",keywords:[{ja:"次亜塩素酸ナトリウム",reading:"じあえんそさんなとりうむ",my:"ဆိုဒီယမ်ဟိုက်ပိုကလိုရိုက်"}]},
  {id:"h004",category:"hygiene",type:"academic",question:"食品衛生法に基づく営業許可は、誰が交付しますか。",options:["都道府県知事","厚生労働大臣","市区町村長","保健所長"],correctAnswer:3,explanation:"飲食店の営業許可は、店舗所在地を管轄する保健所長が交付します。",keywords:[{ja:"営業許可",reading:"えいぎょうきょか",my:"စီးပွားရေးလုပ်ကိုင်ခွင့်"},{ja:"保健所",reading:"ほけんじょ",my:"ကျန်းမာရေးဌာန"}]},
  {id:"h005",category:"hygiene",type:"academic",question:"食中毒菌の増殖条件として、正しいものはどれですか。",options:["ほとんどの食中毒菌は10℃以下では増殖しない","食中毒菌は乾燥した環境で最もよく増殖する","食中毒菌の増殖には光が必要である","食中毒菌は酸性の環境で最もよく増殖する"],correctAnswer:0,explanation:"食中毒菌の多くは10℃以下で増殖が抑制されます。「つけない・増やさない・やっつける」が予防の三原則です。",keywords:[{ja:"食中毒菌",reading:"しょくちゅうどくきん",my:"အစားအစာ အဆိပ်သင့်ပိုး"}]},
  {id:"h006",category:"hygiene",type:"academic",question:"アレルゲン表示が義務付けられている特定原材料はいくつですか。",options:["5品目","7品目","8品目","28品目"],correctAnswer:2,explanation:"特定原材料（表示義務）は、えび、かに、くるみ、小麦、そば、卵、乳、落花生の8品目です。",keywords:[{ja:"特定原材料",reading:"とくていげんざいりょう",my:"သတ်မှတ်ထားသော ကုန်ကြမ်းပစ္စည်းများ"}]},
  {id:"h007",category:"hygiene",type:"practical",question:"従業員が嘔吐した場合、最初に行うべき対応はどれですか。",options:["すぐに嘔吐物を拭き取る","嘔吐した従業員を隔離し、周囲の人を遠ざける","保健所に電話する","アルコールで消毒する"],correctAnswer:1,explanation:"まず従業員を隔離し周囲の人を遠ざけます。アルコールはノロウイルスには効果がありません。次亜塩素酸ナトリウム1000ppm以上で消毒します。",keywords:[{ja:"嘔吐",reading:"おうと",my:"အန်ခြင်း"},{ja:"隔離",reading:"かくり",my:"သီးသန့်ခွဲထုတ်ခြင်း"}]},
  {id:"h008",category:"hygiene",type:"academic",question:"黄色ブドウ球菌の毒素の特徴として、正しいものはどれですか。",options:["低温で無毒化される","加熱しても分解されない","酸性で分解される","アルコールで無効化できる"],correctAnswer:1,explanation:"黄色ブドウ球菌のエンテロトキシンは耐熱性が高く、100℃30分の加熱でも分解されません。手指の傷が主な感染源です。",keywords:[{ja:"黄色ブドウ球菌",reading:"おうしょくぶどうきゅうきん",my:"ရွှေရောင်စတက်ဖိုလိုကိုးကပ်စ်"}]},
  {id:"h009",category:"hygiene",type:"practical",question:"冷蔵庫の温度が8℃に上昇していた場合の対応として適切なものは。",options:["食材の状態を確認し問題なければ使う","設定温度を下げ、食材の状態を確認・記録し上司に報告する","すべての食材を廃棄する","翌日まで様子を見る"],correctAnswer:1,explanation:"温度異常発見時は設定温度を確認・調整し、保管食材の状態を確認・記録、上司に報告します。",keywords:[{ja:"温度管理",reading:"おんどかんり",my:"အပူချိန်ထိန်းချုပ်ခြင်း"}]},
  {id:"h010",category:"hygiene",type:"academic",question:"交差汚染を防止する最も適切な対策はどれですか。",options:["生肉用と野菜用のまな板を色分けして使い分ける","食材を同じ冷蔵庫の同じ棚に保管する","調理後に手洗いすればよい","まな板を水で流してから別の食材を切る"],correctAnswer:0,explanation:"交差汚染防止には食材ごとに調理器具を使い分けます。まな板や包丁を色分けし用途別に管理します。",keywords:[{ja:"交差汚染",reading:"こうさおせん",my:"ကူးစက်ညစ်ညမ်းခြင်း"}]},
  {id:"h011",category:"hygiene",type:"academic",question:"カンピロバクター食中毒の主な原因はどれですか。",options:["牛肉の生食","鶏肉の加熱不足","貝類の生食","野菜の洗浄不足"],correctAnswer:1,explanation:"カンピロバクター食中毒は鶏肉の加熱不足や生食が主な原因です。潜伏期間は2〜5日です。",keywords:[]},
  {id:"h012",category:"hygiene",type:"academic",question:"食品の「危険温度帯」として正しいものはどれですか。",options:["0℃〜10℃","10℃〜60℃","20℃〜50℃","30℃〜70℃"],correctAnswer:1,explanation:"10℃〜60℃は食中毒菌が最も増殖しやすい「危険温度帯」です。",keywords:[{ja:"危険温度帯",reading:"きけんおんどたい",my:"အန္တရာယ်ရှိ အပူချိန်ဇုန်"}]},
  {id:"h013",category:"hygiene",type:"academic",question:"サルモネラ菌による食中毒の主な原因食品はどれですか。",options:["魚介類","卵・鶏肉","穀物","乳製品"],correctAnswer:1,explanation:"サルモネラ菌は卵や鶏肉に多く存在します。十分な加熱で予防できます。",keywords:[]},
  {id:"h014",category:"hygiene",type:"academic",question:"腸管出血性大腸菌O157の特徴として正しいものはどれですか。",options:["高温多湿で増殖が止まる","少量の菌でも食中毒を起こす","加熱に強い","潜伏期間は1〜2時間と短い"],correctAnswer:1,explanation:"O157は少量でも感染し重篤な症状を起こします。75℃1分以上の加熱で死滅します。",keywords:[]},
  {id:"h015",category:"hygiene",type:"academic",question:"ウェルシュ菌食中毒の特徴として正しいものはどれですか。",options:["生魚が主な原因","大量調理食品を室温放置すると起こりやすい","潜伏期間は3〜5日","低温で増殖しやすい"],correctAnswer:1,explanation:"カレーやシチューなど大量調理食品を室温放置すると増殖します。",keywords:[]},
  {id:"h016",category:"hygiene",type:"academic",question:"食品衛生責任者について正しいものはどれですか。",options:["調理師免許がないとなれない","各営業施設に1人以上置く必要がある","保健所長が任命する","5年ごとに更新が必要"],correctAnswer:1,explanation:"営業施設ごとに1人以上配置が義務付けられています。",keywords:[]},
  {id:"h017",category:"hygiene",type:"practical",question:"従業員に手指の切り傷がある場合の最も適切な対応は。",options:["絆創膏を貼って調理を続ける","絆創膏を貼りさらに使い捨て手袋を着用させる","その日は休ませる","傷が小さければそのまま調理"],correctAnswer:1,explanation:"手指の傷は黄色ブドウ球菌の温床。絆創膏で覆い使い捨て手袋を着用します。",keywords:[]},
  {id:"h018",category:"hygiene",type:"academic",question:"冷凍食品の最も衛生的な解凍方法はどれですか。",options:["室温で自然解凍","冷蔵庫内で解凍","温水に浸けて解凍","直射日光に当てて解凍"],correctAnswer:1,explanation:"冷蔵庫内での解凍が最も衛生的です。",keywords:[]},
  {id:"h019",category:"hygiene",type:"academic",question:"HACCPにおける「CCP」とは何ですか。",options:["衛生管理計画","重要管理点","危害要因分析","品質管理基準"],correctAnswer:1,explanation:"CCPはCritical Control Pointの略です。",keywords:[]},
  {id:"h020",category:"hygiene",type:"practical",question:"食中毒が疑われる報告があった場合、最初にすべきことは。",options:["該当の食品を廃棄する","店長に報告し保健所への連絡を判断する","症状が軽ければ様子を見る","お客様に薬を渡す"],correctAnswer:1,explanation:"直ちに責任者に報告します。証拠となる食品は廃棄せず保管します。",keywords:[]},
  {id:"h021",category:"hygiene",type:"academic",question:"手洗いの正しい手順で最初に行うことはどれですか。",options:["石鹸をつける","流水で手を濡らす","手指消毒剤をつける","ペーパータオルで拭く"],correctAnswer:1,explanation:"①流水で手を濡らす→②石鹸→③洗う→④流す→⑤拭く→⑥消毒の順です。",keywords:[]},
  {id:"h022",category:"hygiene",type:"academic",question:"腸炎ビブリオ食中毒の特徴として正しいものはどれですか。",options:["冬季に多い","海水中に生息し刺身が主な原因食品","加熱しても死滅しない","潜伏期間は5〜7日"],correctAnswer:1,explanation:"海水中に生息し夏季に多く発生。真水で洗うことで予防できます。",keywords:[]},
  {id:"h023",category:"hygiene",type:"practical",question:"調理従事者の健康管理として毎日行うべきことはどれですか。",options:["血液検査","検便","体温・下痢・嘔吐の有無を確認し記録","レントゲン撮影"],correctAnswer:2,explanation:"毎日始業前に体温測定、下痢・嘔吐・傷の有無を確認し記録します。",keywords:[]},
  {id:"h024",category:"hygiene",type:"academic",question:"ボツリヌス菌の特徴として正しいものはどれですか。",options:["好気性の菌","嫌気性で真空パック等で増殖する","酸性環境で最も増殖する","芽胞を形成しない"],correctAnswer:1,explanation:"嫌気性菌で真空パック食品や缶詰など酸素のない環境で増殖します。",keywords:[]},
  {id:"h025",category:"hygiene",type:"academic",question:"食品の保管温度について正しいものはどれですか。",options:["冷蔵10℃以下・冷凍−15℃以下","冷蔵5℃以下・冷凍−10℃以下","冷蔵10℃以下・冷凍−20℃以下","冷蔵8℃以下・冷凍−18℃以下"],correctAnswer:0,explanation:"食品衛生法では冷蔵10℃以下・冷凍−15℃以下と定められています。",keywords:[]},
  {id:"h026",category:"hygiene",type:"academic",question:"リステリア菌の特徴として正しいものはどれですか。",options:["加熱に強い","冷蔵庫の温度でも増殖できる","酸性環境で生存不可","乾燥した環境を好む"],correctAnswer:1,explanation:"4℃以下の低温でも増殖できる特殊な細菌です。",keywords:[]},
  // COOKING
  {id:"c001",category:"cooking",type:"academic",question:"魚の鮮度を見分ける方法として正しいものはどれですか。",options:["目が白く濁っているものが新鮮","えらが鮮やかな赤色のものが新鮮","身を押すと跡が残るものが新鮮","表面が乾燥しているものが新鮮"],correctAnswer:1,explanation:"新鮮な魚はえらが鮮やかな赤色で、目が透明、身に弾力があります。",keywords:[{ja:"鮮度",reading:"せんど",my:"လတ်ဆတ်မှု"}]},
  {id:"c002",category:"cooking",type:"academic",question:"「ブランチング」とは何ですか。",options:["食材を油で素揚げ","食材を短時間ゆでて冷水にとること","食材を塩水に漬ける","食材を低温で長時間加熱"],correctAnswer:1,explanation:"短時間ゆでた後すぐに冷水にとる調理法で色の鮮やかさを保ちます。",keywords:[]},
  {id:"c003",category:"cooking",type:"academic",question:"揚げ油の交換時期の目安として正しいものは。",options:["色が薄くなった","泡が消えにくく粘りが出てきた","油の量が半分になった","使用回数が3回を超えた"],correctAnswer:1,explanation:"泡立ちが消えにくい、粘りが出る、色が濃くなる場合は交換します。",keywords:[]},
  {id:"c004",category:"cooking",type:"academic",question:"先入れ先出し（FIFO）の目的として最も適切なものは。",options:["在庫数量の正確な把握","食材の鮮度を保ち廃棄ロスを減らす","仕入れコストの削減","調理作業の効率化"],correctAnswer:1,explanation:"先に仕入れた食材を先に使い期限切れによる廃棄ロスを最小限にします。",keywords:[]},
  {id:"c005",category:"cooking",type:"academic",question:"真空調理法（スーヴィード）の特徴として正しいものは。",options:["高温短時間で加熱","真空パックし低温で長時間加熱","水分を抜いて保存性向上","高圧で食材を柔らかくする"],correctAnswer:1,explanation:"食材を真空パックし50〜85℃程度の低温で長時間加熱する方法です。",keywords:[]},
  {id:"c006",category:"cooking",type:"practical",question:"新人に包丁の持ち方を指導する最も重要なポイントは。",options:["刃先に近い部分を持つ","親指と人差し指で刃元を挟むように持つ","力を入れて強く握る","反対の手で持つ練習をさせる"],correctAnswer:1,explanation:"親指と人差し指で刃元を挟み残りの指で柄を握ります。",keywords:[]},
  {id:"c007",category:"cooking",type:"academic",question:"「アルデンテ」とはどのような状態ですか。",options:["完全に柔らかくなった状態","芯がわずかに残る固さの状態","焦げ目がついた状態","冷めた状態"],correctAnswer:1,explanation:"パスタの芯がわずかに残る固さです。",keywords:[]},
  {id:"c008",category:"cooking",type:"academic",question:"だしを取る際の昆布の正しい扱い方は。",options:["沸騰したお湯に入れて長時間煮る","水から入れて沸騰直前に取り出す","高温の油で揚げる","塩水に浸けてから使う"],correctAnswer:1,explanation:"水から昆布を入れ沸騰直前に取り出すのが基本です。",keywords:[]},
  {id:"c009",category:"cooking",type:"academic",question:"食材の「あく抜き」の目的として正しいものは。",options:["食材の色を悪くする","渋みやえぐみを取り除く","食材を硬くする","食材の栄養を減らす"],correctAnswer:1,explanation:"渋み・えぐみ・苦みの成分を取り除く工程です。",keywords:[]},
  {id:"c010",category:"cooking",type:"academic",question:"揚げ物の適切な油の温度の一般的な目安は。",options:["100〜120℃","140〜180℃","200〜220℃","250〜280℃"],correctAnswer:1,explanation:"低温140〜160℃、中温160〜180℃、高温180〜200℃が基本です。",keywords:[]},
  {id:"c011",category:"cooking",type:"practical",question:"品質統一のために最も重要なことは。",options:["優秀なスタッフだけに作らせる","レシピを整備し計量を徹底する","毎日味見して調整する","調味料を自由に使わせる"],correctAnswer:1,explanation:"レシピの標準化と計量の徹底が品質統一に不可欠です。",keywords:[]},
  {id:"c012",category:"cooking",type:"academic",question:"食材の「マリネ」とは何ですか。",options:["食材を高温で焼く","酢や油などの調味液に漬け込む","冷凍保存する","燻製にする"],correctAnswer:1,explanation:"酢、油、ハーブ等を合わせた液に漬け込む調理法です。",keywords:[]},
  // SERVICE
  {id:"s001",category:"service",type:"academic",question:"クレーム対応の基本手順として最も適切なものは。",options:["すぐに値引きを提案する","まず謝罪しお客様の話を最後まで傾聴する","責任者が来るまで対応しない","他のお客様の前で事情を聞く"],correctAnswer:1,explanation:"①謝罪→②傾聴→③事実確認→④解決策提案→⑤再発防止が基本です。",keywords:[{ja:"傾聴",reading:"けいちょう",my:"စေ့စေ့နားထောင်ခြင်း"}]},
  {id:"s002",category:"service",type:"academic",question:"食物アレルギーの申告への最も適切な対応は。",options:["アレルギー対応メニューを出す","具体的なアレルゲンを確認し調理担当に伝える","「大丈夫です」と安心させる","別の店を勧める"],correctAnswer:1,explanation:"命に関わるため具体的なアレルゲンを確認し正確に伝えることが最重要です。",keywords:[]},
  {id:"s003",category:"service",type:"academic",question:"未成年者へのお酒の提供について正しいものは。",options:["保護者と一緒なら提供可","少量なら提供可","いかなる場合も提供不可","本人が20歳と申告すれば提供可"],correctAnswer:2,explanation:"未成年者飲酒禁止法により20歳未満への酒類提供は禁止です。",keywords:[]},
  {id:"s004",category:"service",type:"academic",question:"電話予約で確認すべき項目に含まれないものは。",options:["来店日時と人数","お客様の年収","お名前と連絡先","アレルギーの有無"],correctAnswer:1,explanation:"プライベートな情報は聞きません。",keywords:[]},
  {id:"s005",category:"service",type:"practical",question:"満席時の来店客への最も適切な対応は。",options:["「満席です」とだけ伝える","待ち時間の目安を伝え待つか確認する","他の店を紹介する","無言で首を横に振る"],correctAnswer:1,explanation:"お詫びし待ち時間の目安を伝え待つか確認します。",keywords:[]},
  {id:"s006",category:"service",type:"practical",question:"新人の接客指導で最も効果的な方法は。",options:["マニュアルを渡して読ませる","見学→実践→フィードバックの流れ","最初から一人で接客させる","動画を見せるだけ"],correctAnswer:1,explanation:"①見学②実践③フィードバックのOJTの基本です。",keywords:[]},
  {id:"s007",category:"service",type:"academic",question:"料理に異物混入の訴えがあった場合、最初にすべきことは。",options:["原因を調べてから対応","直ちにお詫びし料理を下げる","「ありえません」と否定","すぐに代わりの料理を出す"],correctAnswer:1,explanation:"まず直ちにお詫びし料理を下げます。",keywords:[]},
  {id:"s008",category:"service",type:"academic",question:"「ホスピタリティ」の説明として最も適切なものは。",options:["マニュアル通りに正確にサービス","お客様の状況を察し期待を超えるおもてなし","お客様の要望にすべて従う","早くサービスを提供する"],correctAnswer:1,explanation:"マニュアルを超えた心からのおもてなしです。",keywords:[]},
  {id:"s009",category:"service",type:"academic",question:"原料原産地表示について正しいものは。",options:["すべての食材の原産地表示義務がある","聞かれた場合に正確に答えられるようにする","外食店に表示義務は一切ない","肉類のみ義務がある"],correctAnswer:1,explanation:"質問に正確に答えられるよう準備が必要です。",keywords:[]},
  {id:"s010",category:"service",type:"academic",question:"接客の「5大用語」に含まれないものは。",options:["いらっしゃいませ","かしこまりました","申し訳ございません","お元気ですか"],correctAnswer:3,explanation:"5大用語：いらっしゃいませ/かしこまりました/少々お待ちください/申し訳ございません/ありがとうございました",keywords:[]},
  {id:"s011",category:"service",type:"practical",question:"領収書を求められた場合に確認すべきことは。",options:["お客様の住所","宛名（但し書きの要否含む）","お客様の職業","支払い方法の理由"],correctAnswer:1,explanation:"宛名と但し書きを確認します。",keywords:[]},
  {id:"s012",category:"service",type:"practical",question:"酔ったお客様が騒ぎ始めた場合の対応は。",options:["放置する","さらにお酒を勧める","穏やかに声をかけ水を提供し必要なら責任者に相談","すぐに退店を求める"],correctAnswer:2,explanation:"穏やかに声をかけ水やソフトドリンクを提供します。",keywords:[]},
  // OPERATIONS
  {id:"o001",category:"operations",type:"academic",question:"FLコストの適正比率として一般的なものは。",options:["売上高の40〜50%","売上高の55〜65%","売上高の70〜80%","売上高の30〜40%"],correctAnswer:1,explanation:"FLコスト（原材料費＋人件費）は売上高の55〜65%が適正です。",keywords:[{ja:"FLコスト",reading:"えふえるこすと",my:"အစားအစာနှင့်လုပ်သားကုန်ကျစရိတ်"}]},
  {id:"o002",category:"operations",type:"academic",question:"損益分岐点売上高の計算式として正しいものは。",options:["固定費÷変動費率","固定費÷（1−変動費率）","（固定費+変動費）÷売上高","売上高×利益率"],correctAnswer:1,explanation:"損益分岐点売上高＝固定費÷（1−変動費率）です。",keywords:[{ja:"損益分岐点",reading:"そんえきぶんきてん",my:"အရှုံးအမြတ်ချိန်ခွင်မျှမှတ်"}]},
  {id:"o003",category:"operations",type:"academic",question:"原価率の計算式として正しいものは。",options:["売上高÷原価×100","原価÷売上高×100","（売上高−原価）÷売上高×100","原価÷利益×100"],correctAnswer:1,explanation:"原価率＝原価÷売上高×100（%）です。",keywords:[{ja:"原価率",reading:"げんかりつ",my:"ကုန်ကျစရိတ်နှုန်း"}]},
  {id:"o004",category:"operations",type:"academic",question:"労働基準法の法定労働時間として正しいものは。",options:["1日10時間、週50時間","1日8時間、週40時間","1日7時間、週35時間","1日9時間、週45時間"],correctAnswer:1,explanation:"法定労働時間は1日8時間、週40時間です。",keywords:[]},
  {id:"o005",category:"operations",type:"practical",question:"売上目標500万円、原価率30%、人件費率28%の場合の食材費＋人件費合計は？",options:["240万円","260万円","290万円","300万円"],correctAnswer:2,explanation:"食材費=150万、人件費=140万。合計290万円。",keywords:[]},
  {id:"o006",category:"operations",type:"academic",question:"ABC分析について正しいものは。",options:["従業員能力をA〜Cで評価","売上貢献度で商品をA〜Cにランク分け","満足度を3段階で測定","食材の鮮度をA〜Cで分類"],correctAnswer:1,explanation:"売上や粗利益への貢献度で商品をランク分けする手法です。",keywords:[]},
  {id:"o007",category:"operations",type:"academic",question:"シフト管理で最も重要な考え方は。",options:["常に最小人数で運営","売上予測に基づき適正な人員配置","全員同じ時間帯に配置","従業員の希望をすべて優先"],correctAnswer:1,explanation:"売上予測に基づく「適正人員配置」が重要です。",keywords:[]},
  {id:"o008",category:"operations",type:"practical",question:"食材原価400円、原価率32%に設定する場合の売価は？",options:["1,000円","1,125円","1,250円","1,280円"],correctAnswer:2,explanation:"売価=400÷0.32=1,250円。",keywords:[]},
  {id:"o009",category:"operations",type:"academic",question:"客単価を上げるための最も適切な施策は。",options:["メニュー価格をすべて値上げ","セットメニューやデザート提案で追加注文を促す","席数を増やす","営業時間を延長"],correctAnswer:1,explanation:"アップセル・クロスセルが効果的です。",keywords:[]},
  {id:"o010",category:"operations",type:"academic",question:"棚卸しの主な目的はどれですか。",options:["新しい食材を注文するため","実際の在庫と帳簿の差異を把握するため","賞味期限切れを探すため","倉庫を整理するため"],correctAnswer:1,explanation:"実際の在庫と帳簿上の在庫を照合し差異を把握します。",keywords:[]},
  {id:"o011",category:"operations",type:"practical",question:"固定費200万円、変動費率40%の損益分岐点売上高は？",options:["約286万円","約333万円","約400万円","約500万円"],correctAnswer:1,explanation:"200万÷0.6≒333万円。",keywords:[]},
  {id:"o012",category:"operations",type:"academic",question:"従業員のモチベーション向上に最も効果的な方法は。",options:["給与を上げるだけ","適切な目標設定・評価・フィードバック","厳しく叱る","全員に同じ仕事を与える"],correctAnswer:1,explanation:"目標設定・公正な評価・フィードバック・成長機会が効果的です。",keywords:[]},
  {id:"o013",category:"operations",type:"academic",question:"「粗利益」の計算式として正しいものは。",options:["売上高−人件費","売上高−原価（食材費）","売上高−（原価+人件費+家賃）","利益×売上高"],correctAnswer:1,explanation:"粗利益＝売上高−原価（食材費）です。",keywords:[]},
  {id:"o014",category:"operations",type:"practical",question:"月の売上高600万円、食材費180万円の場合の原価率は？",options:["25%","28%","30%","33%"],correctAnswer:2,explanation:"180万÷600万×100=30%。",keywords:[]},
  {id:"o015",category:"operations",type:"academic",question:"時間外労働の割増賃金率として正しいものは。",options:["10%以上","25%以上","35%以上","50%以上"],correctAnswer:1,explanation:"時間外25%以上、深夜25%以上、休日35%以上です。",keywords:[]},
  {id:"o016",category:"operations",type:"academic",question:"「回転率」の意味として正しいものは。",options:["従業員の離職率","一定期間に席が何回使われたかの指標","食材の使用頻度","来店頻度"],correctAnswer:1,explanation:"回転率=客数÷席数で席の稼働率を示します。",keywords:[]},
  {id:"o017",category:"operations",type:"practical",question:"売価800円の料理、食材原価280円の場合の原価率は？",options:["28%","30%","33%","35%"],correctAnswer:3,explanation:"280÷800×100=35%。",keywords:[]},
  {id:"o018",category:"operations",type:"academic",question:"有給休暇について正しいものは。",options:["パートには付与されない","6ヶ月継続勤務し8割以上出勤で付与される","会社が取得日を自由に決められる","年最大5日間"],correctAnswer:1,explanation:"6ヶ月間継続勤務し全労働日の8割以上出勤で10日間付与されます。",keywords:[]},
  {id:"o019",category:"operations",type:"academic",question:"「歩留まり率」とは何ですか。",options:["再来店率","食材の使用可能な割合","従業員の出勤率","売上目標の達成率"],correctAnswer:1,explanation:"食材総量に対する使用可能部分の割合です。",keywords:[]},
  {id:"o020",category:"operations",type:"practical",question:"1kgあたり3,000円のまぐろ、歩留まり率50%の場合、刺身100gの食材原価は？",options:["300円","500円","600円","800円"],correctAnswer:2,explanation:"実質6,000円/kg。100g=600円。",keywords:[]},
  {id:"o021",category:"operations",type:"academic",question:"QSCとは何を表す言葉ですか。",options:["品質・サービス・清潔さ","品質・安全・コスト","スピード・サービス・清潔さ","品質・売上・顧客満足度"],correctAnswer:0,explanation:"Quality/Service/Cleanlinessの頭文字です。",keywords:[]},
  {id:"o022",category:"operations",type:"academic",question:"食品ロスを削減する最も適切な取り組みは。",options:["メニューの量を減らす","売上データに基づく仕入れ量の適正化","安い食材だけ使う","お客様に残さないよう強要"],correctAnswer:1,explanation:"売上データ分析による需要予測と適正仕入れが効果的です。",keywords:[]},
  {id:"o023",category:"operations",type:"practical",question:"座席数30席、1日の来客数90人の場合の回転率は？",options:["2回転","3回転","4回転","5回転"],correctAnswer:1,explanation:"90÷30=3回転。",keywords:[]},
];

/* ──────── CALC EXERCISES ──────── */
const CALC_EXERCISES=[
  {id:"calc01",title:"原価率の計算",question:"食材原価350円、売価1,000円の原価率は？",hint:"原価率=原価÷売上高×100",answer:"35%",steps:["350÷1,000×100 = 35%"]},
  {id:"calc02",title:"売価の逆算",question:"食材原価420円、原価率30%の場合の売価は？",hint:"売価=原価÷原価率",answer:"1,400円",steps:["420÷0.30 = 1,400円"]},
  {id:"calc03",title:"FLコスト",question:"売上高400万円、食材費120万円、人件費110万円。FLコスト比率は？",hint:"(F+L)÷売上高×100",answer:"57.5%",steps:["(120万+110万)÷400万×100 = 57.5%"]},
  {id:"calc04",title:"損益分岐点売上高",question:"固定費180万円、変動費率35%の損益分岐点売上高は？",hint:"固定費÷(1−変動費率)",answer:"約277万円",steps:["180万÷(1−0.35) = 180万÷0.65 ≒ 277万円"]},
  {id:"calc05",title:"回転率",question:"座席数40席、ランチ来客数120人の回転率は？",hint:"来客数÷座席数",answer:"3回転",steps:["120÷40 = 3回転"]},
  {id:"calc06",title:"人件費率",question:"売上高500万円、総人件費140万円の人件費率は？",hint:"人件費÷売上高×100",answer:"28%",steps:["140÷500×100 = 28%"]},
  {id:"calc07",title:"歩留まり原価",question:"1kg 2,000円の牛肉。歩留まり率60%の実質原価は？",hint:"仕入れ単価÷歩留まり率",answer:"約3,333円/kg",steps:["2,000÷0.60 ≒ 3,333円/kg"]},
  {id:"calc08",title:"客単価",question:"1日の売上高25万円、来客数100人の客単価は？",hint:"売上高÷来客数",answer:"2,500円",steps:["250,000÷100 = 2,500円"]},
  {id:"calc09",title:"粗利益",question:"売上高300万円、食材原価90万円の粗利益と粗利益率は？",hint:"粗利益=売上高−原価",answer:"210万円、70%",steps:["粗利益=300万−90万=210万","粗利益率=210÷300×100=70%"]},
  {id:"calc10",title:"割増賃金",question:"時給1,200円、22時以降2時間残業の賃金は？（50%増）",hint:"時給×1.5×時間",answer:"3,600円",steps:["1,200×1.50=1,800円/時","1,800×2時間=3,600円"]},
];

/* ──────── VOCAB ──────── */
const VOCAB=[
  {ja:"衛生管理",reading:"えいせいかんり",my:"တက်ကျန်းမာရေး စီမံခန့်ခွဲမှု",cat:"hygiene"},{ja:"食中毒",reading:"しょくちゅうどく",my:"အစားအစာ အဆိပ်သင့်ခြင်း",cat:"hygiene"},{ja:"消毒",reading:"しょうどく",my:"ပိုးသတ်ခြင်း",cat:"hygiene"},{ja:"交差汚染",reading:"こうさおせん",my:"ကူးစက်ညစ်ညမ်းခြင်း",cat:"hygiene"},{ja:"営業許可",reading:"えいぎょうきょか",my:"စီးပွားရေးလုပ်ကိုင်ခွင့်",cat:"hygiene"},{ja:"アレルゲン",reading:"あれるげん",my:"ဓာတ်မတည့်မှုဖြစ်စေသည့်အရာ",cat:"hygiene"},{ja:"温度管理",reading:"おんどかんり",my:"အပူချိန်ထိန်းချုပ်ခြင်း",cat:"hygiene"},{ja:"危険温度帯",reading:"きけんおんどたい",my:"အန္တရာယ်ရှိ အပူချိန်ဇုန်",cat:"hygiene"},
  {ja:"鮮度",reading:"せんど",my:"လတ်ဆတ်မှု",cat:"cooking"},{ja:"包丁",reading:"ほうちょう",my:"ဓား",cat:"cooking"},{ja:"揚げる",reading:"あげる",my:"ဆီကြော်ခြင်း",cat:"cooking"},{ja:"煮る",reading:"にる",my:"ပြုတ်ခြင်း",cat:"cooking"},{ja:"蒸す",reading:"むす",my:"ပေါင်းခြင်း",cat:"cooking"},{ja:"焼く",reading:"やく",my:"ကင်ခြင်း",cat:"cooking"},
  {ja:"クレーム",reading:"くれーむ",my:"တိုင်ကြားချက်",cat:"service"},{ja:"予約",reading:"よやく",my:"ကြိုတင်မှာယူခြင်း",cat:"service"},{ja:"満席",reading:"まんせき",my:"ထိုင်ခုံပြည့်နေသည်",cat:"service"},{ja:"接客",reading:"せっきゃく",my:"ဧည့်ခံခြင်း",cat:"service"},{ja:"傾聴",reading:"けいちょう",my:"စေ့စေ့နားထောင်ခြင်း",cat:"service"},
  {ja:"売上高",reading:"うりあげだか",my:"ရောင်းအားစုစုပေါင်း",cat:"operations"},{ja:"原価率",reading:"げんかりつ",my:"ကုန်ကျစရိတ်နှုန်း",cat:"operations"},{ja:"人件費",reading:"じんけんひ",my:"လုပ်သားစရိတ်",cat:"operations"},{ja:"損益分岐点",reading:"そんえきぶんきてん",my:"အရှုံးအမြတ်ချိန်ခွင်မျှမှတ်",cat:"operations"},{ja:"棚卸し",reading:"たなおろし",my:"ကုန်ပစ္စည်းစာရင်းစစ်ခြင်း",cat:"operations"},{ja:"固定費",reading:"こていひ",my:"ပုံသေကုန်ကျစရိတ်",cat:"operations"},{ja:"変動費",reading:"へんどうひ",my:"ပြောင်းလဲကုန်ကျစရိတ်",cat:"operations"},{ja:"客単価",reading:"きゃくたんか",my:"ဧည့်သည်တစ်ဦးချင်း ပျမ်းမျှသုံးစွဲငွေ",cat:"operations"},{ja:"割増賃金",reading:"わりましちんぎん",my:"အပိုကြေးလုပ်ခ",cat:"operations"},{ja:"回転率",reading:"かいてんりつ",my:"လည်ပတ်နှုန်း",cat:"operations"},{ja:"歩留まり率",reading:"ぶどまりりつ",my:"သုံးစွဲနိုင်သော ရာခိုင်နှုန်း",cat:"operations"},{ja:"QSC",reading:"きゅーえすしー",my:"အရည်အသွေး・ ဝန်ဆောင်မှု・ သန့်ရှင်းမှု",cat:"operations"},
];

/* ──────── UTILS ──────── */
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function loadStats(){try{const s=localStorage.getItem("tg2_stats");return s?JSON.parse(s):null}catch{return null}}
function saveStats(s){try{localStorage.setItem("tg2_stats",JSON.stringify(s))}catch{}}
function loadWrong(){try{const w=localStorage.getItem("tg2_wrong");return w?JSON.parse(w):[]}catch{return[]}}
function saveWrong(ids){try{localStorage.setItem("tg2_wrong",JSON.stringify(ids))}catch{}}
function loadDark(){try{return localStorage.getItem("tg2_dark")==="true"}catch{return false}}
function saveDark(v){try{localStorage.setItem("tg2_dark",String(v))}catch{}}
function getDateKey(){const d=new Date(Date.now()+9*3600000);return d.toISOString().slice(0,10)}
function loadStreak(){try{const s=localStorage.getItem("tg2_streak");return s?JSON.parse(s):{lastDate:null,count:0}}catch{return{lastDate:null,count:0}}}
function saveStreak(s){try{localStorage.setItem("tg2_streak",JSON.stringify(s))}catch{}}
function updateStreak(streak){
  const today=getDateKey();if(streak.lastDate===today)return streak;
  const d=new Date(Date.now()+9*3600000);d.setDate(d.getDate()-1);const yesterday=d.toISOString().slice(0,10);
  const newCount=streak.lastDate===yesterday?streak.count+1:1;
  const next={lastDate:today,count:newCount};saveStreak(next);return next;
}

/* ──────── BADGES ──────── */
const BADGES=[
  {id:"first_answer",icon:"🌱",name:"最初の一歩",desc:"初めての問題に回答した"},
  {id:"correct_10",icon:"⭐",name:"10問正解",desc:"正解数が10に到達"},
  {id:"correct_50",icon:"🌟",name:"50問正解",desc:"正解数が50に到達"},
  {id:"correct_100",icon:"💫",name:"100問正解",desc:"正解数が100に到達"},
  {id:"answered_50",icon:"📚",name:"50問挑戦",desc:"50問に回答した"},
  {id:"answered_200",icon:"📖",name:"200問挑戦",desc:"200問に回答した"},
  {id:"streak_3",icon:"🔥",name:"3日連続",desc:"3日連続で学習した"},
  {id:"streak_7",icon:"🔥",name:"7日連続！",desc:"7日連続で学習した"},
  {id:"accuracy_65",icon:"🎯",name:"合格ライン",desc:"正答率65%以上（20問以上回答）"},
  {id:"all_cats",icon:"🗺️",name:"全分野制覇",desc:"全4分野に1問以上回答した"},
];
function badgeCondition(id,stats,streak){
  const s=stats;const st=streak;
  switch(id){
    case"first_answer":return s.totalAnswered>=1;
    case"correct_10":return s.totalCorrect>=10;
    case"correct_50":return s.totalCorrect>=50;
    case"correct_100":return s.totalCorrect>=100;
    case"answered_50":return s.totalAnswered>=50;
    case"answered_200":return s.totalAnswered>=200;
    case"streak_3":return(st?.count??0)>=3;
    case"streak_7":return(st?.count??0)>=7;
    case"accuracy_65":return s.totalAnswered>=20&&(s.totalCorrect/s.totalAnswered)>=0.65;
    case"all_cats":return Object.keys(s.byCategory||{}).filter(k=>(s.byCategory[k]?.answered||0)>0).length>=4;
    default:return false;
  }
}
function loadBadges(){try{const b=localStorage.getItem("tg2_badges");return b?JSON.parse(b):[]}catch{return[]}}
function saveBadges(b){try{localStorage.setItem("tg2_badges",JSON.stringify(b))}catch{}}
function checkNewBadges(earned,stats,streak){
  const s=new Set(earned);const newB=[];
  BADGES.forEach(b=>{if(!s.has(b.id)&&badgeCondition(b.id,stats,streak)){s.add(b.id);newB.push(b.id)}});
  return{all:[...s],newOnes:newB};
}

/* ──────── SHARED COMPONENTS ──────── */
function ProgressBar({value,max,color="bg-amber-500"}){const p=max>0?(value/max)*100:0;return<div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all duration-500`} style={{width:`${p}%`}}/></div>}

function PassBar({pct}){
  const passed=pct>=PASS_LINE;
  return(
    <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 mb-6 overflow-visible">
      <div className={`h-full rounded-full transition-all duration-700 ${passed?"bg-emerald-500":"bg-rose-500"}`} style={{width:`${Math.min(pct,100)}%`}}/>
      <div className="absolute top-0 h-full flex items-center" style={{left:`${PASS_LINE}%`}}>
        <div className="w-0.5 h-8 -mt-1 bg-gray-800 dark:bg-gray-200 opacity-60"/>
      </div>
      <div className="absolute text-[10px] font-bold text-gray-500 dark:text-gray-400" style={{left:`${PASS_LINE}%`,top:"-16px",transform:"translateX(-50%)"}}>合格{PASS_LINE}%</div>
      <div className={`absolute text-xs font-bold ${passed?"text-emerald-700 dark:text-emerald-300":"text-rose-700 dark:text-rose-300"}`} style={{left:`${Math.min(Math.max(pct,5),95)}%`,bottom:"-18px",transform:"translateX(-50%)"}}>{pct}%▲</div>
    </div>
  )
}

function HeaderBar({title,onBack,right}){return<div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10"><button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ArrowLeft size={20}/></button><h2 className="flex-1 font-medium text-gray-800 dark:text-gray-100 text-base">{title}</h2>{right}</div>}

/* ──────── ★ NEW: ○✕ OVERLAY ──────── */
function AnswerOverlay({type}){
  return(
    <div className={`tg2-overlay fixed inset-0 z-50 flex items-center justify-center ${type==="correct"?"bg-emerald-500/20":"bg-rose-500/20"}`}>
      <div className={`tg2-symbol text-[140px] font-black leading-none ${type==="correct"?"text-emerald-500":"text-rose-500"}`}>
        {type==="correct"?"○":"✕"}
      </div>
    </div>
  )
}

/* ──────── ★ BADGE TOAST ──────── */
function BadgeToast({badgeId,onDismiss}){
  const badge=BADGES.find(b=>b.id===badgeId);
  useEffect(()=>{const t=setTimeout(onDismiss,4000);return()=>clearTimeout(t)},[badgeId]);
  if(!badge)return null;
  return(
    <div onClick={onDismiss} className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 cursor-pointer" style={{animation:"tg2-pop 0.4s ease-out"}}>
      <span className="text-3xl">{badge.icon}</span>
      <div><p className="font-bold text-sm">バッジ獲得！</p><p className="text-xs opacity-90">{badge.name} — {badge.desc}</p></div>
    </div>
  )
}

/* ──────── LOGIN SCREEN ──────── */
function LoginScreen({onLogin,loading}){
  return(
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg mb-4"><Sparkles size={32} className="text-white"/></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">外食業 特定技能2号</h1>
      <p className="text-sm text-gray-500 mb-1">技能測定試験 学習アプリ</p>
      <p className="text-xs text-gray-400 mb-8" style={{fontFamily:"'Padauk',sans-serif"}}>စားသောက်ဆိုင်လုပ်ငန်း ကျွမ်းကျင်မှု စာမေးပွဲ</p>
      <button onClick={onLogin} disabled={loading} className="w-full max-w-xs flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50">
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.01 24.01 0 000 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        <span className="text-sm font-medium text-gray-700">{loading?"ログイン中...":"Googleでログイン"}</span>
      </button>
      <p className="text-xs text-gray-400 mt-4 text-center">ログインすると、メンターとの連携や<br/>デバイス間の学習データ同期が使えます</p>
      <button onClick={()=>window.__skipLogin?.()} className="mt-6 text-xs text-gray-400 underline">ログインせずに使う</button>
    </div>
  )
}

/* ──────── SETUP SCREEN ──────── */
function SetupScreen({user,onComplete}){
  const [name,setName]=useState("");const [code,setCode]=useState("");const [role,setRole]=useState("learner");
  const [facilityName,setFacilityName]=useState("");const [mode,setMode]=useState("join");
  const [error,setError]=useState("");const [loading,setLoading]=useState(false);

  const handleSubmit=async()=>{
    if(!name.trim())return setError("名前を入力してください");
    if(!code.trim())return setError("施設コードを入力してください");
    setLoading(true);setError("");
    const c=code.trim().toUpperCase();
    if(mode==="join"){
      const f=await getFacility(c);
      if(!f){setLoading(false);return setError("施設コードが見つかりません")}
    }else{
      if(!facilityName.trim()){setLoading(false);return setError("施設名を入力してください")}
      const exists=await getFacility(c);
      if(exists){setLoading(false);return setError("このコードは既に使われています")}
      await createFacility(c,user.uid,facilityName.trim());
    }
    await onComplete(name.trim(),c,role);
    setLoading(false);
  };

  return(
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex flex-col items-center px-6 pt-16">
      <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-md mb-3"><Sparkles size={24} className="text-white"/></div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">プロフィール設定</h2>
      <p className="text-xs text-gray-500 mb-6">{user?.email}</p>

      <div className="w-full max-w-sm space-y-4">
        <div><label className="text-xs font-medium text-gray-600 mb-1 block">名前</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="例: ミン" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"/></div>

        <div><label className="text-xs font-medium text-gray-600 mb-1 block">あなたの役割</label>
          <div className="flex gap-2">
            <button onClick={()=>setRole("learner")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${role==="learner"?"bg-amber-50 border-amber-500 text-amber-700":"bg-white border-gray-200 text-gray-500"}`}>学習者</button>
            <button onClick={()=>setRole("mentor")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${role==="mentor"?"bg-blue-50 border-blue-500 text-blue-700":"bg-white border-gray-200 text-gray-500"}`}>メンター</button>
          </div>
        </div>

        {role==="mentor"&&(
          <div><label className="text-xs font-medium text-gray-600 mb-1 block">施設コードの登録方法</label>
            <div className="flex gap-2">
              <button onClick={()=>setMode("join")} className={`flex-1 py-2 rounded-lg text-xs font-medium border ${mode==="join"?"bg-gray-800 text-white border-gray-800":"bg-white border-gray-200 text-gray-500"}`}>既存のコードに参加</button>
              <button onClick={()=>setMode("create")} className={`flex-1 py-2 rounded-lg text-xs font-medium border ${mode==="create"?"bg-gray-800 text-white border-gray-800":"bg-white border-gray-200 text-gray-500"}`}>新しく作成</button>
            </div>
          </div>
        )}

        <div><label className="text-xs font-medium text-gray-600 mb-1 block">施設コード</label>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="例: REST001" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"/>
          <p className="text-xs text-gray-400 mt-1">{role==="learner"?"メンターから教えてもらったコードを入力":"施設を識別するコード（英数字）"}</p>
        </div>

        {mode==="create"&&role==="mentor"&&(
          <div><label className="text-xs font-medium text-gray-600 mb-1 block">施設名</label>
            <input value={facilityName} onChange={e=>setFacilityName(e.target.value)} placeholder="例: ABCレストラン" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"/></div>
        )}

        {error&&<p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 bg-amber-500 text-white rounded-xl text-sm font-medium active:scale-[0.98] disabled:opacity-50">
          {loading?"設定中...":"設定を完了"}
        </button>
      </div>
    </div>
  )
}

/* ──────── HOME ──────── */
function HomeScreen({onNavigate,stats,dark,setDark,wrongCount,streak,badgeCount,profile,onLogout}){
  const catKeys=Object.keys(CATEGORIES);
  return(
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md"><Sparkles size={20} className="text-white"/></div>
          <div><h1 className="text-lg font-bold text-gray-900 dark:text-white">外食業 特定技能2号</h1><p className="text-xs text-gray-500 dark:text-gray-400" style={{fontFamily:"'Padauk',sans-serif"}}>စားသောက်ဆိုင်လုပ်ငန်း ကျွမ်းကျင်မှု အဆင့် ၂</p></div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={()=>setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">{dark?<Sun size={18} className="text-amber-400"/>:<Moon size={18} className="text-gray-500"/>}</button>
          {onLogout&&<button onClick={onLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><LogOut size={16} className="text-gray-400"/></button>}
        </div>
      </div>
      {/* Profile bar */}
      {profile&&(
        <div className="mx-5 mb-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 rounded-xl flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">{(profile.name||"?")[0]}</div>
          <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{profile.name}</span>
          {profile.facilityCode&&<span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full ml-auto">{profile.facilityCode}</span>}
        </div>
      )}
      {/* ★ STREAK BANNER */}
      {streak.count>=2&&(
        <div className="mx-5 mb-3 px-4 py-2.5 bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center gap-3">
          <div className="flex items-center gap-1"><Flame size={22} className="text-orange-500"/><span className="text-xl font-bold text-orange-600 dark:text-orange-400">{streak.count}</span></div>
          <div><p className="text-sm font-medium text-orange-700 dark:text-orange-300">{streak.count}日連続で学習中！</p><p className="text-xs text-orange-500 dark:text-orange-400" style={{fontFamily:"'Padauk',sans-serif"}}>ဆက်တိုက် {streak.count} ရက် လေ့လာနေပါတယ်!</p></div>
        </div>
      )}
      {stats.totalAnswered>0&&(
        <div className="mx-5 mb-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-700 dark:text-gray-200">学習の進捗</span><span className="text-sm font-bold text-amber-600 dark:text-amber-400">{stats.totalCorrect}/{stats.totalAnswered}</span></div>
          <ProgressBar value={stats.totalCorrect} max={stats.totalAnswered}/>
          <p className="text-xs text-gray-400 mt-1">正答率 {Math.round((stats.totalCorrect/stats.totalAnswered)*100)}% ・ 全{QUESTIONS.length}問中</p>
        </div>
      )}
      <div className="px-5 mb-2"><h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">分野別クイズ</h3></div>
      <div className="px-5 grid grid-cols-2 gap-3 mb-4">
        {catKeys.map(key=>{const cat=CATEGORIES[key];const Icon=cat.icon;const total=QUESTIONS.filter(q=>q.category===key).length;const a=stats.byCategory[key]?.answered||0;const c=stats.byCategory[key]?.correct||0;
          return(<button key={key} onClick={()=>onNavigate("quiz",key)} className={`p-4 rounded-2xl ${cat.colorLight} border ${cat.colorBorder} text-left transition-all active:scale-95 hover:shadow-md`}><div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center mb-2 shadow-sm`}><Icon size={18} className="text-white"/></div><p className={`font-bold text-sm ${cat.colorText}`}>{cat.name_ja}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat.desc}</p><p className="text-xs text-gray-400 mt-0.5">{total}問・{cat.points}点</p>{a>0&&<p className="text-xs text-gray-400 mt-1">{c}/{a} 正解</p>}</button>)
        })}
      </div>
      <div className="px-5 mb-2"><h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">その他の学習</h3></div>
      <div className="px-5 flex flex-col gap-2.5 pb-20">
        {wrongCount>0&&<button onClick={()=>onNavigate("review")} className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-950 rounded-2xl border border-rose-200 dark:border-rose-800 shadow-sm active:scale-[0.98]"><div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center shadow-sm"><RefreshCw size={20} className="text-white"/></div><div className="text-left flex-1"><p className="font-bold text-sm text-rose-700 dark:text-rose-300">間違えた問題を復習</p><p className="text-xs text-rose-500">{wrongCount}問</p></div><ChevronRight size={16} className="text-rose-300"/></button>}
        <NavBtn icon={<Clock size={20} className="text-white"/>} bg="bg-emerald-500" title="模擬試験モード" sub="本番形式・70分タイマー" onClick={()=>onNavigate("mock")}/>
        <NavBtn icon={<BarChart3 size={20} className="text-white"/>} bg="bg-blue-500" title="進捗・成績" sub="分野別の正答率・合格条件を確認" onClick={()=>onNavigate("progress")}/>
        <NavBtn icon={<Calculator size={20} className="text-white"/>} bg="bg-indigo-500" title="計算練習" sub="原価率・損益分岐点・歩留まり" onClick={()=>onNavigate("calc")}/>
        <NavBtn icon={<BookOpen size={20} className="text-white"/>} bg="bg-teal-500" title="単語帳" sub={`日本語↔ミャンマー語 (${VOCAB.length}語)`} onClick={()=>onNavigate("vocab")}/>
        <NavBtn icon={<Award size={20} className="text-white"/>} bg="bg-amber-500" title="バッジ" sub={`${badgeCount}/${BADGES.length} 獲得`} onClick={()=>onNavigate("badges")}/>
      </div>
    </div>
  )
}
function NavBtn({icon,bg,title,sub,onClick}){return<button onClick={onClick} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.98] hover:shadow-md transition-all"><div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shadow-sm`}>{icon}</div><div className="text-left flex-1"><p className="font-bold text-sm text-gray-800 dark:text-gray-100">{title}</p><p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p></div><ChevronRight size={16} className="text-gray-300"/></button>}

/* ──────── ★ QUIZ with overlay + explain screen ──────── */
function QuizScreen({category,onBack,onUpdateStats,onWrongAnswer,onRemoveWrong,reviewIds}){
  const isReview=!!reviewIds;
  const questions=useMemo(()=>{if(isReview)return shuffle(QUESTIONS.filter(q=>reviewIds.includes(q.id)));return shuffle(QUESTIONS.filter(q=>q.category===category))},[category,reviewIds]);
  const [idx,setIdx]=useState(0);const [selected,setSelected]=useState(null);
  const [phase,setPhase]=useState("answering"); // "answering" | "overlay" | "explain"
  const [overlayType,setOverlayType]=useState(null);
  const [score,setScore]=useState(0);const [done,setDone]=useState(false);
  const [perQ,setPerQ]=useState([]); // track per-question results for result screen

  if(questions.length===0)return<div className="min-h-screen bg-gray-50 dark:bg-gray-950"><HeaderBar title="復習" onBack={onBack}/><div className="flex flex-col items-center pt-20 px-6"><Trophy size={48} className="text-emerald-500 mb-4"/><p className="text-lg font-bold dark:text-white">復習する問題はありません！</p><button onClick={onBack} className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium">ホームに戻る</button></div></div>;

  const q=questions[idx];const total=questions.length;const qCat=CATEGORIES[q.category];

  const handleSelect=(i)=>{
    if(phase!=="answering")return;setSelected(i);
    const isCorrect=i===q.correctAnswer;
    if(isCorrect){setScore(s=>s+1);if(onRemoveWrong)onRemoveWrong(q.id)}else{if(onWrongAnswer)onWrongAnswer(q.id)}
    if(!isReview)onUpdateStats(q.category,isCorrect);
    setPerQ(p=>[...p,{cat:q.category,correct:isCorrect}]);
    setOverlayType(isCorrect?"correct":"wrong");setPhase("overlay");
    setTimeout(()=>setPhase("explain"),800);
  };
  const handleNext=()=>{if(idx+1>=total){setDone(true);return}setIdx(i=>i+1);setSelected(null);setPhase("answering");setOverlayType(null)};

  // ★ RESULT SCREEN with PassBar
  if(done){
    const pct=Math.round((score/total)*100);const passed=pct>=PASS_LINE;
    const byCat={};perQ.forEach(r=>{if(!byCat[r.cat])byCat[r.cat]={c:0,t:0};byCat[r.cat].t++;if(r.correct)byCat[r.cat].c++});
    return(
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <HeaderBar title={isReview?"復習 結果":`${qCat.name_ja} 結果`} onBack={onBack}/>
        <div className="flex flex-col items-center px-6 pt-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 ${passed?"bg-emerald-100 dark:bg-emerald-900":"bg-rose-100 dark:bg-rose-900"}`}>
            {passed?<Trophy size={40} className="text-emerald-600 dark:text-emerald-400"/>:<RotateCcw size={40} className="text-rose-600 dark:text-rose-400"/>}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{score}<span className="text-lg text-gray-400">/{total}</span></h2>
          <p className={`text-base font-semibold mt-1 ${passed?"text-emerald-600 dark:text-emerald-400":"text-rose-600 dark:text-rose-400"}`}>{passed?"合格ライン達成！":"もう少し頑張りましょう"}</p>
          {/* ★ PassBar */}
          <div className="w-full mt-4 px-2"><PassBar pct={pct}/></div>
          {/* Breakdown cards */}
          <div className="w-full grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700"><p className="text-xl font-bold text-emerald-600">{score}</p><p className="text-xs text-gray-500">正解</p></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700"><p className="text-xl font-bold text-rose-600">{total-score}</p><p className="text-xs text-gray-500">不正解</p></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700"><p className={`text-xl font-bold ${passed?"text-emerald-600":"text-rose-600"}`}>{pct}%</p><p className="text-xs text-gray-500">正答率</p></div>
          </div>
          {/* ★ Subject breakdown bars */}
          {Object.keys(byCat).length>1&&(
            <div className="w-full mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">分野別スコア</h3>
              {Object.entries(byCat).map(([key,val])=>{const r=Math.round(val.c/val.t*100);return(
                <div key={key} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-300">{CATEGORIES[key].name_ja}</span><span className={`font-bold ${r>=PASS_LINE?"text-emerald-600 dark:text-emerald-400":"text-rose-600 dark:text-rose-400"}`}>{val.c}/{val.t} ({r}%)</span></div>
                  <div className="relative w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className={`h-full rounded-full ${r>=PASS_LINE?"bg-emerald-500":"bg-rose-500"}`} style={{width:`${r}%`}}/>
                    <div className="absolute top-0 h-full" style={{left:`${PASS_LINE}%`}}><div className="w-px h-full bg-gray-400 dark:bg-gray-500"/></div>
                  </div>
                </div>
              )})}
            </div>
          )}
          <div className="w-full mt-6 flex gap-3 mb-8">
            <button onClick={onBack} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300">ホームに戻る</button>
            <button onClick={()=>{setIdx(0);setSelected(null);setPhase("answering");setScore(0);setDone(false);setPerQ([])}} className={`flex-1 py-3 rounded-xl text-sm font-medium text-white ${isReview?"bg-rose-500":qCat.color}`}>もう一度</button>
          </div>
        </div>
      </div>
    );
  }

  // ★ EXPLAIN SCREEN (separate from quiz)
  if(phase==="explain"){
    const isCorrect=selected===q.correctAnswer;
    return(
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Banner */}
        <div className={`px-5 py-6 flex items-center gap-4 ${isCorrect?"bg-emerald-500":"bg-rose-500"}`}>
          <div className="text-5xl font-black text-white/90">{isCorrect?"○":"✕"}</div>
          <div><p className="text-white font-bold text-lg">{isCorrect?"正解！":"不正解"}</p>
            {!isCorrect&&<p className="text-white/80 text-sm mt-0.5">正解：{String.fromCharCode(65+q.correctAnswer)}. {q.options[q.correctAnswer]}</p>}
          </div>
        </div>
        <div className="px-5 pt-5 pb-32">
          {/* Question recap */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
            <p className="text-xs text-gray-400 mb-1">問題</p>
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">{q.question}</p>
          </div>
          {/* Your answer vs correct */}
          {!isCorrect&&selected!==null&&(
            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-xl p-3 border border-rose-200 dark:border-rose-700 mb-3">
              <p className="text-xs text-rose-500 font-medium mb-1">あなたの回答</p>
              <p className="text-sm text-rose-800 dark:text-rose-200">{String.fromCharCode(65+selected)}. {q.options[selected]}</p>
            </div>
          )}
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 border border-emerald-200 dark:border-emerald-700 mb-4">
            <p className="text-xs text-emerald-500 font-medium mb-1">正解</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-200">{String.fromCharCode(65+q.correctAnswer)}. {q.options[q.correctAnswer]}</p>
          </div>
          {/* Explanation */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2"><Brain size={16} className="text-amber-600 dark:text-amber-400"/><span className="text-sm font-bold text-amber-700 dark:text-amber-300">解説</span></div>
            <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{q.explanation}</p>
            {q.keywords?.length>0&&(
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">重要用語</p>
                {q.keywords.map((kw,ki)=><div key={ki} className="flex items-baseline gap-2 text-xs mb-1"><span className="font-bold text-gray-800 dark:text-gray-100">{kw.ja}</span><span className="text-gray-400">({kw.reading})</span>{kw.my&&<span className="text-amber-700 dark:text-amber-300" style={{fontFamily:"'Padauk',sans-serif"}}>{kw.my}</span>}</div>)}
              </div>
            )}
          </div>
        </div>
        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleNext} className={`w-full py-3.5 rounded-xl text-sm font-medium text-white ${isCorrect?"bg-emerald-500":"bg-rose-500"} active:scale-[0.98]`}>
            {idx+1>=total?"結果を見る":"次の問題へ"} <ArrowRight size={14} className="inline ml-1"/>
          </button>
        </div>
      </div>
    );
  }

  // ★ QUIZ ANSWERING SCREEN
  return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {phase==="overlay"&&overlayType&&<AnswerOverlay type={overlayType}/>}
      <HeaderBar title={isReview?"間違えた問題の復習":qCat.name_ja} onBack={onBack} right={<span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{idx+1}/{total}</span>}/>
      <div className="px-4 pt-3"><ProgressBar value={idx+1} max={total} color={isReview?"bg-rose-500":qCat.color}/></div>
      <div className="px-4 pt-4 pb-32">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorText} font-medium`}>{CATEGORIES[q.category].name_ja}</span>
            <span className="text-xs text-gray-400">{q.type==="academic"?"学科":"実技"}</span>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{q.question}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt,i)=>(
            <button key={i} onClick={()=>handleSelect(i)} disabled={phase!=="answering"} className={`w-full p-4 rounded-xl border-2 text-left transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 ${phase==="answering"?"active:scale-[0.98] hover:border-gray-300 dark:hover:border-gray-600":""}`}>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500">{String.fromCharCode(65+i)}</span>
                <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────── MOCK EXAM ──────── */
function MockExamScreen({onBack,onUpdateStats,onWrongAnswer}){
  const allQ=useMemo(()=>shuffle([...QUESTIONS]).slice(0,55),[]);
  const [idx,setIdx]=useState(0);const [answers,setAnswers]=useState({});const [timeLeft,setTimeLeft]=useState(70*60);
  const [started,setStarted]=useState(false);const [submitted,setSubmitted]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{if(started&&!submitted&&timeLeft>0){timerRef.current=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);return 0}return t-1}),1000);return()=>clearInterval(timerRef.current)}},[started,submitted,timeLeft]);
  const mins=Math.floor(timeLeft/60);const secs=timeLeft%60;

  const handleSubmit=()=>{setSubmitted(true);clearInterval(timerRef.current);allQ.forEach((q,i)=>{if(answers[i]!==undefined){const c=answers[i]===q.correctAnswer;onUpdateStats(q.category,c);if(!c)onWrongAnswer(q.id)}})};

  if(!started) return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><HeaderBar title="模擬試験" onBack={onBack}/>
      <div className="flex flex-col items-center px-6 pt-12">
        <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4"><Clock size={36} className="text-emerald-600 dark:text-emerald-400"/></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">模擬試験モード</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">本番と同じ形式で練習しましょう</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 w-full mb-6">
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">問題数</span><span className="font-bold dark:text-white">{allQ.length}問</span></div>
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">制限時間</span><span className="font-bold dark:text-white">70分</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">合格基準</span><span className="font-bold text-emerald-600">{PASS_LINE}%以上</span></div>
        </div>
        <button onClick={()=>setStarted(true)} className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-medium text-sm active:scale-[0.98]">試験を開始する</button>
      </div>
    </div>
  );

  if(submitted){
    let correct=0;allQ.forEach((q,i)=>{if(answers[i]===q.correctAnswer)correct++});const pct=Math.round(correct/allQ.length*100);const passed=pct>=PASS_LINE;
    const byCat={};allQ.forEach((q,i)=>{if(!byCat[q.category])byCat[q.category]={c:0,t:0};byCat[q.category].t++;if(answers[i]===q.correctAnswer)byCat[q.category].c++});
    return(
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><HeaderBar title="模擬試験 結果" onBack={onBack}/>
        <div className="flex flex-col items-center px-5 pt-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 ${passed?"bg-emerald-100 dark:bg-emerald-900":"bg-rose-100 dark:bg-rose-900"}`}>{passed?<Trophy size={40} className="text-emerald-600"/>:<RotateCcw size={40} className="text-rose-600"/>}</div>
          <h2 className="text-3xl font-bold dark:text-white">{correct}<span className="text-lg text-gray-400">/{allQ.length}</span></h2>
          <p className={`text-lg font-bold ${passed?"text-emerald-600":"text-rose-600"}`}>{passed?"合格！":"不合格"}</p>
          <div className="w-full mt-4 px-2"><PassBar pct={pct}/></div>
          <div className="w-full mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">分野別スコア</h3>
            {Object.entries(byCat).map(([key,val])=>{const r=Math.round(val.c/val.t*100);return(
              <div key={key} className="mb-3 last:mb-0"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-300">{CATEGORIES[key].name_ja}</span><span className={`font-bold ${r>=PASS_LINE?"text-emerald-600":"text-rose-600"}`}>{val.c}/{val.t}</span></div>
              <div className="relative w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full"><div className={`h-full rounded-full ${r>=PASS_LINE?"bg-emerald-500":"bg-rose-500"}`} style={{width:`${r}%`}}/><div className="absolute top-0 h-full" style={{left:`${PASS_LINE}%`}}><div className="w-px h-full bg-gray-400"/></div></div></div>
            )})}
          </div>
          <button onClick={onBack} className="w-full mt-6 mb-8 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300">ホームに戻る</button>
        </div>
      </div>
    );
  }

  const q=allQ[idx];
  return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{idx+1}/{allQ.length}</span>
        <span className={`text-sm font-bold font-mono ${timeLeft<300?"text-rose-600":"text-gray-700 dark:text-gray-200"}`}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</span>
        <button onClick={handleSubmit} className="text-sm font-medium text-emerald-600">提出</button>
      </div>
      <div className="px-4 pt-2"><ProgressBar value={idx+1} max={allQ.length} color="bg-emerald-500"/></div>
      <div className="px-4 pt-4 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorText} font-medium`}>{CATEGORIES[q.category].name_ja}</span>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed mt-3">{q.question}</p>
        </div>
        <div className="flex flex-col gap-2.5">{q.options.map((opt,i)=>(
          <button key={i} onClick={()=>setAnswers(a=>({...a,[idx]:i}))} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[idx]===i?`${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorBorder}`:"bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"} active:scale-[0.98]`}>
            <div className="flex items-start gap-3"><span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${answers[idx]===i?`${CATEGORIES[q.category].color} border-transparent text-white`:"border-gray-300 dark:border-gray-600 text-gray-500"}`}>{String.fromCharCode(65+i)}</span><span className="text-sm leading-relaxed pt-0.5 dark:text-gray-100">{opt}</span></div>
          </button>
        ))}</div>
        <div className="flex gap-3 mt-6">
          <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 disabled:opacity-30">前へ</button>
          {idx+1<allQ.length?<button onClick={()=>setIdx(i=>i+1)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium active:scale-[0.98]">次へ</button>
          :<button onClick={handleSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold active:scale-[0.98]">提出する</button>}
        </div>
      </div>
    </div>
  );
}

/* ──────── ★ NEW: PROGRESS SCREEN ──────── */
function ProgressScreen({onBack,stats,wrongCount}){
  const answered=stats.totalAnswered;const correct=stats.totalCorrect;
  const pct=answered>0?Math.round(correct/answered*100):0;
  const catKeys=Object.keys(CATEGORIES);
  const catStats=catKeys.map(key=>{
    const a=stats.byCategory[key]?.answered||0;const c=stats.byCategory[key]?.correct||0;
    const r=a>0?Math.round(c/a*100):null;const total=QUESTIONS.filter(q=>q.category===key).length;
    return{key,a,c,r,total,...CATEGORIES[key]};
  });
  const passedCats=catStats.filter(s=>s.r!==null&&s.r>=PASS_LINE).length;
  const allCatsPassed=passedCats>=catKeys.length;
  const overallPassed=answered>0&&pct>=PASS_LINE;

  return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <HeaderBar title="進捗・成績" onBack={onBack}/>
      <div className="px-5 pt-5 pb-24">
        {/* Overall accuracy */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 mb-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">全体の正答率</h3>
          {answered===0?<p className="text-sm text-gray-400 mt-2">まだ問題を解いていません</p>:(
            <>
              <PassBar pct={pct}/>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">{answered}問回答（{correct}問正解）</span>
                <span className={`font-bold ${pct>=PASS_LINE?"text-emerald-600 dark:text-emerald-400":"text-rose-600 dark:text-rose-400"}`}>{pct>=PASS_LINE?"合格ライン達成":"合格ラインまであと"+(PASS_LINE-pct)+"%"}</span>
              </div>
            </>
          )}
        </div>

        {/* Per-subject bars */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 mb-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">分野別の正答率</h3>
          {catStats.map(s=>{const Icon=s.icon;return(
            <div key={s.key} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${s.color} flex items-center justify-center`}><Icon size={13} className="text-white"/></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.name_ja}</span>
                  <span className="text-xs text-gray-400">({s.total}問)</span>
                </div>
                {s.r!==null?<span className={`text-sm font-bold ${s.r>=PASS_LINE?"text-emerald-600 dark:text-emerald-400":"text-rose-600 dark:text-rose-400"}`}>{s.r}%</span>
                :<span className="text-xs text-gray-400">未回答</span>}
              </div>
              <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                {s.r!==null&&<div className={`h-full rounded-full transition-all duration-500 ${s.r>=PASS_LINE?"bg-emerald-500":"bg-rose-400"}`} style={{width:`${s.r}%`}}/>}
                <div className="absolute top-0 h-full" style={{left:`${PASS_LINE}%`}}><div className="w-px h-full bg-gray-500 dark:bg-gray-400 opacity-50"/></div>
              </div>
              {s.a>0&&<p className="text-xs text-gray-400 mt-1">{s.c}/{s.a} 正解・配点{s.points}点</p>}
            </div>
          )})}
        </div>

        {/* Pass conditions checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 mb-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">合格条件チェック</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              {overallPassed?<CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5"/>:<Circle size={20} className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5"/>}
              <div>
                <p className={`text-sm font-medium ${overallPassed?"text-emerald-700 dark:text-emerald-400":"text-gray-600 dark:text-gray-300"}`}>全体正答率が{PASS_LINE}%以上</p>
                <p className="text-xs text-gray-400">{answered>0?`現在 ${pct}%`:"未回答"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {allCatsPassed?<CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5"/>:<Circle size={20} className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5"/>}
              <div>
                <p className={`text-sm font-medium ${allCatsPassed?"text-emerald-700 dark:text-emerald-400":"text-gray-600 dark:text-gray-300"}`}>全4分野で{PASS_LINE}%以上</p>
                <p className="text-xs text-gray-400">現在 {passedCats}/{catKeys.length} 分野達成</p>
              </div>
            </div>
          </div>
          {overallPassed&&allCatsPassed?(
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700 text-center">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">🎉 すべての合格条件を満たしています！</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5" style={{fontFamily:"'Padauk',sans-serif"}}>အားလုံးအောင်မြင်ပါသည်!</p>
            </div>
          ):(
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-amber-700 dark:text-amber-300">本番の試験は250点満点中{PASS_LINE}%（163点）以上で合格です。すべての分野をバランスよく学習しましょう。</p>
            </div>
          )}
        </div>

        {/* Weak questions count */}
        {wrongCount>0&&(
          <div className="bg-rose-50 dark:bg-rose-900/30 rounded-2xl p-4 border border-rose-200 dark:border-rose-700">
            <div className="flex items-center gap-3">
              <RefreshCw size={18} className="text-rose-500"/>
              <div><p className="text-sm font-medium text-rose-700 dark:text-rose-300">間違えた問題: {wrongCount}問</p><p className="text-xs text-rose-500 dark:text-rose-400">ホームから「間違えた問題を復習」で復習できます</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────── ★ BADGES SCREEN ──────── */
function BadgesScreen({onBack,earnedIds}){
  const earned=new Set(earnedIds);
  const earnedBadges=BADGES.filter(b=>earned.has(b.id));
  const lockedBadges=BADGES.filter(b=>!earned.has(b.id));
  return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <HeaderBar title={`バッジ (${earnedBadges.length}/${BADGES.length})`} onBack={onBack}/>
      <div className="px-5 pt-5 pb-24">
        {earnedBadges.length>0&&(
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">獲得済み</h3>
            <div className="grid grid-cols-2 gap-3">
              {earnedBadges.map(b=>(
                <div key={b.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-amber-200 dark:border-amber-700 shadow-sm text-center">
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{b.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {lockedBadges.length>0&&(
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">未獲得</h3>
            <div className="grid grid-cols-2 gap-3">
              {lockedBadges.map(b=>(
                <div key={b.id} className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 text-center opacity-60">
                  <div className="text-3xl mb-2 grayscale">🔒</div>
                  <p className="font-bold text-sm text-gray-500 dark:text-gray-400">{b.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {earnedBadges.length===0&&(
          <div className="text-center pt-12">
            <div className="text-5xl mb-4">🏅</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">まだバッジを獲得していません</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">問題を解くとバッジがもらえます！</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────── CALC SCREEN ──────── */
function CalcScreen({onBack}){
  const [idx,setIdx]=useState(0);const [show,setShow]=useState(false);const ex=CALC_EXERCISES[idx];
  return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><HeaderBar title="計算練習" onBack={onBack} right={<span className="text-sm text-gray-500">{idx+1}/{CALC_EXERCISES.length}</span>}/>
      <div className="px-4 pt-3"><ProgressBar value={idx+1} max={CALC_EXERCISES.length} color="bg-indigo-500"/></div>
      <div className="px-4 pt-4 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">{ex.title}</p>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{ex.question}</p>
          <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"><p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">ヒント</p><p className="text-sm text-indigo-800 dark:text-indigo-200 font-mono">{ex.hint}</p></div>
        </div>
        {!show?<button onClick={()=>setShow(true)} className="w-full py-3.5 bg-indigo-500 text-white rounded-xl text-sm font-medium active:scale-[0.98]"><Eye size={16} className="inline mr-2"/>答えを見る</button>
        :<div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Check size={18} className="text-emerald-600 dark:text-emerald-400"/><span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{ex.answer}</span></div>
          {ex.steps.map((s,i)=><p key={i} className="text-sm text-emerald-800 dark:text-emerald-200 font-mono mb-1">{s}</p>)}
          <div className="flex gap-3 mt-4">
            <button onClick={()=>{if(idx>0){setIdx(i=>i-1);setShow(false)}}} disabled={idx===0} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-30 dark:text-gray-300">前へ</button>
            <button onClick={()=>{if(idx<CALC_EXERCISES.length-1){setIdx(i=>i+1);setShow(false)}else onBack()}} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl text-sm font-medium active:scale-[0.98]">{idx<CALC_EXERCISES.length-1?"次の問題":"完了"}</button>
          </div>
        </div>}
      </div>
    </div>
  );
}

/* ──────── VOCAB SCREEN ──────── */
function VocabScreen({onBack}){
  const [filter,setFilter]=useState("all");const [showR,setShowR]=useState(true);const [showM,setShowM]=useState(true);
  const [flash,setFlash]=useState(false);const [fi,setFi]=useState(0);const [flipped,setFlipped]=useState(false);
  const filtered=filter==="all"?VOCAB:VOCAB.filter(v=>v.cat===filter);
  const shuffled=useMemo(()=>shuffle(filtered),[filter]);

  if(flash){const card=shuffled[fi];if(!card)return null;return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><HeaderBar title="フラッシュカード" onBack={()=>setFlash(false)} right={<span className="text-sm text-gray-500">{fi+1}/{shuffled.length}</span>}/>
      <div className="px-5 pt-8 flex flex-col items-center">
        <button onClick={()=>setFlipped(f=>!f)} className="w-full max-w-sm aspect-[3/2] bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-6 active:scale-[0.98]">
          {!flipped?<><p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{card.ja}</p><p className="text-xs text-gray-400">タップして答えを見る</p></>
          :<><p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{card.ja}</p><p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{card.reading}</p><p className="text-lg text-amber-700 dark:text-amber-300 font-medium" style={{fontFamily:"'Padauk',sans-serif"}}>{card.my}</p></>}
        </button>
        <div className="flex gap-3 mt-6 w-full max-w-sm">
          <button onClick={()=>{setFi(i=>Math.max(0,i-1));setFlipped(false)}} disabled={fi===0} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-30 dark:text-gray-300">前へ</button>
          <button onClick={()=>{setFi(i=>Math.min(shuffled.length-1,i+1));setFlipped(false)}} disabled={fi>=shuffled.length-1} className="flex-1 py-3 bg-teal-500 text-white rounded-xl text-sm font-medium active:scale-[0.98] disabled:opacity-30">次へ</button>
        </div>
      </div>
    </div>
  )}

  return(
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><HeaderBar title={`単語帳 (${filtered.length}語)`} onBack={onBack} right={<button onClick={()=>{setFlash(true);setFi(0);setFlipped(false)}} className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded-lg font-medium">カード</button>}/>
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">{[{k:"all",l:"すべて"},...Object.entries(CATEGORIES).map(([k,v])=>({k,l:v.name_ja}))].map(f=><button key={f.k} onClick={()=>setFilter(f.k)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${filter===f.k?"bg-teal-500 text-white":"bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>{f.l}</button>)}</div>
      <div className="px-4 flex gap-4 mb-3"><label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><input type="checkbox" checked={showR} onChange={e=>setShowR(e.target.checked)} className="rounded"/>読み仮名</label><label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><input type="checkbox" checked={showM} onChange={e=>setShowM(e.target.checked)} className="rounded"/>ミャンマー語</label></div>
      <div className="px-4 pb-24 flex flex-col gap-2">{filtered.map((v,i)=><div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700"><div className="flex items-baseline justify-between"><span className="font-bold text-gray-900 dark:text-white">{v.ja}</span><span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[v.cat]?.colorLight} ${CATEGORIES[v.cat]?.colorText}`}>{CATEGORIES[v.cat]?.name_ja}</span></div>{showR&&<p className="text-xs text-gray-400 mt-0.5">{v.reading}</p>}{showM&&<p className="text-sm text-amber-700 dark:text-amber-300 mt-1" style={{fontFamily:"'Padauk',sans-serif"}}>{v.my}</p>}</div>)}</div>
    </div>
  );
}

/* ──────── APP ──────── */
export default function App(){
  const [screen,setScreen]=useState("loading");const [quizCat,setQuizCat]=useState(null);const [dark,setDark]=useState(false);
  const [stats,setStats]=useState({totalAnswered:0,totalCorrect:0,byCategory:{}});const [wrongIds,setWrongIds]=useState([]);
  const [streak,setStreak]=useState({lastDate:null,count:0});
  const [badges,setBadges]=useState([]);
  const [toastQueue,setToastQueue]=useState([]);
  // Auth state
  const [fireUser,setFireUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [authLoading,setAuthLoading]=useState(false);

  // Initialize: load local data + check auth
  useEffect(()=>{
    const s=loadStats();if(s)setStats(s);
    setWrongIds(loadWrong());setDark(loadDark());setStreak(loadStreak());setBadges(loadBadges());

    if(!isConfigured){
      // Firebase未設定 → オフラインモード（ログイン不要）
      setScreen("home");return;
    }
    // Firebase設定済み → 認証状態を監視
    const unsub=onAuthStateChanged(auth,(user)=>{
      setFireUser(user);
      if(!user){setScreen("login");return}
      // ログイン済み → プロフィール確認
      getUserProfile(user.uid).then(p=>{
        if(p&&p.facilityCode){setProfile(p);setScreen("home")}
        else{setProfile(p);setScreen("setup")}
      });
    });
    return unsub;
  },[]);

  useEffect(()=>{document.documentElement.classList.toggle("dark",dark);saveDark(dark)},[dark]);

  // Skip login (offline mode)
  useEffect(()=>{window.__skipLogin=()=>setScreen("home");return()=>{delete window.__skipLogin}},[]);

  const nav=(s,cat)=>{setScreen(s);if(cat)setQuizCat(cat)};

  const handleLogin=async()=>{
    if(!auth)return;
    setAuthLoading(true);
    try{await signInWithPopup(auth,provider)}
    catch(e){console.error(e);alert("ログインに失敗しました")}
    setAuthLoading(false);
  };

  const handleSetupComplete=async(name,code,role)=>{
    if(!fireUser)return;
    const p={name,facilityCode:code,role};
    await setUserProfile(fireUser.uid,p);
    setProfile(p);setScreen("home");
  };

  const handleLogout=async()=>{
    if(!auth)return;
    await signOut(auth);setFireUser(null);setProfile(null);setScreen("login");
  };

  // Cloud sync helper
  const doSync=useCallback((nextStats,nextStreak)=>{
    if(fireUser&&profile&&isConfigured){
      syncLearnerStats(fireUser.uid,nextStats,nextStreak,profile);
    }
  },[fireUser,profile]);

  const updateStats=useCallback((cat,isCorrect)=>{
    setStats(prev=>{
      const bc={...prev.byCategory};if(!bc[cat])bc[cat]={answered:0,correct:0};
      bc[cat]={answered:bc[cat].answered+1,correct:bc[cat].correct+(isCorrect?1:0)};
      const next={totalAnswered:prev.totalAnswered+1,totalCorrect:prev.totalCorrect+(isCorrect?1:0),byCategory:bc};
      saveStats(next);
      setStreak(prevSt=>{
        const nextSt=updateStreak(prevSt);
        const{all,newOnes}=checkNewBadges(loadBadges(),next,nextSt);
        if(newOnes.length>0){saveBadges(all);setBadges(all);setToastQueue(q=>[...q,...newOnes])}
        doSync(next,nextSt);
        return nextSt;
      });
      return next;
    });
  },[doSync]);
  const addWrong=useCallback((id)=>{setWrongIds(p=>{const n=p.includes(id)?p:[...p,id];saveWrong(n);return n})},[]);
  const removeWrong=useCallback((id)=>{setWrongIds(p=>{const n=p.filter(x=>x!==id);saveWrong(n);return n})},[]);
  const dismissToast=useCallback(()=>{setToastQueue(q=>q.slice(1))},[]);
  const goHome=()=>{setScreen("home");setQuizCat(null)};

  // Loading screen
  if(screen==="loading")return(
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center">
      <div className="text-center"><div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg mx-auto mb-3"><Sparkles size={28} className="text-white"/></div><p className="text-sm text-gray-500">読み込み中...</p></div>
    </div>
  );

  return<>
    <InjectStyles/>
    {toastQueue.length>0&&<BadgeToast badgeId={toastQueue[0]} onDismiss={dismissToast}/>}
    {screen==="login"&&<LoginScreen onLogin={handleLogin} loading={authLoading}/>}
    {screen==="setup"&&<SetupScreen user={fireUser} onComplete={handleSetupComplete}/>}
    {screen==="quiz"&&<QuizScreen category={quizCat} onBack={goHome} onUpdateStats={updateStats} onWrongAnswer={addWrong} onRemoveWrong={removeWrong}/>}
    {screen==="review"&&<QuizScreen onBack={goHome} onUpdateStats={updateStats} onWrongAnswer={addWrong} onRemoveWrong={removeWrong} reviewIds={wrongIds}/>}
    {screen==="mock"&&<MockExamScreen onBack={goHome} onUpdateStats={updateStats} onWrongAnswer={addWrong}/>}
    {screen==="progress"&&<ProgressScreen onBack={goHome} stats={stats} wrongCount={wrongIds.length}/>}
    {screen==="badges"&&<BadgesScreen onBack={goHome} earnedIds={badges}/>}
    {screen==="calc"&&<CalcScreen onBack={goHome}/>}
    {screen==="vocab"&&<VocabScreen onBack={goHome}/>}
    {screen==="home"&&<HomeScreen onNavigate={nav} stats={stats} dark={dark} setDark={setDark} wrongCount={wrongIds.length} streak={streak} badgeCount={badges.length} profile={profile} onLogout={isConfigured?handleLogout:null}/>}
  </>
}
