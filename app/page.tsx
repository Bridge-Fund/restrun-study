"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Shield, ChefHat, Users, Store, ArrowLeft, ArrowRight, Check, X, BookOpen, Trophy, Clock, RotateCcw, Brain, Sparkles, Eye, EyeOff, Calculator, Home, BarChart3, Layers } from "lucide-react";

const CATEGORIES = {
  hygiene: { name_ja: "衛生管理", name_my: "တက်ကျန်းမာရေး စီမံခန့်ခွဲမှု", icon: Shield, color: "bg-rose-500", colorLight: "bg-rose-50", colorText: "text-rose-700", colorBorder: "border-rose-200", points: 40, desc: "HACCP・食中毒菌・消毒" },
  cooking: { name_ja: "飲食物調理", name_my: "အစားအစာ ချက်ပြုတ်ခြင်း", icon: ChefHat, color: "bg-amber-500", colorLight: "bg-amber-50", colorText: "text-amber-700", colorBorder: "border-amber-200", points: 10, desc: "食材・調理法・器具" },
  service: { name_ja: "接客全般", name_my: "ဧည့်ခံခြင်း အထွေထွေ", icon: Users, color: "bg-sky-500", colorLight: "bg-sky-50", colorText: "text-sky-700", colorBorder: "border-sky-200", points: 30, desc: "クレーム・アレルギー・お酒" },
  operations: { name_ja: "店舗運営", name_my: "ဆိုင်ခွဲ စီမံခန့်ခွဲမှု", icon: Store, color: "bg-violet-500", colorLight: "bg-violet-50", colorText: "text-violet-700", colorBorder: "border-violet-200", points: 40, desc: "原価率・損益分岐点・シフト" },
};

const QUESTIONS = [
  { id:"h001", category:"hygiene", type:"academic", question:"HACCPの7原則に含まれないものはどれですか。", options:["危害要因分析","重要管理点の決定","従業員の健康診断の実施","モニタリング方法の設定"], correctAnswer:2, explanation:"HACCPの7原則は、①危害要因分析、②重要管理点（CCP）の決定、③管理基準の設定、④モニタリング方法の設定、⑤改善措置の設定、⑥検証方法の設定、⑦記録の保持です。", keywords:[{ja:"危害要因分析",reading:"きがいよういんぶんせき",my:"အန္တရာယ်ဖြစ်စေသော အချက်များ ခွဲခြမ်းစိတ်ဖြာခြင်း"},{ja:"重要管理点",reading:"じゅうようかんりてん",my:"အရေးကြီးသော ထိန်းချုပ်မှတ်"}] },
  { id:"h002", category:"hygiene", type:"academic", question:"ノロウイルスによる食中毒の予防として、最も適切なものはどれですか。", options:["食品の中心温度を65℃で1分間加熱する","食品の中心温度を85〜90℃で90秒間以上加熱する","食品を冷蔵庫で10℃以下に保管する","調理前に食品を流水で30秒間洗う"], correctAnswer:1, explanation:"ノロウイルスは熱に比較的強いため、中心温度85〜90℃で90秒間以上の加熱が必要です。", keywords:[{ja:"ノロウイルス",reading:"のろういるす",my:"နိုရိုဗိုင်းရပ်စ်"},{ja:"中心温度",reading:"ちゅうしんおんど",my:"ဗဟိုအပူချိန်"}] },
  { id:"h003", category:"hygiene", type:"academic", question:"次亜塩素酸ナトリウムによる消毒で正しいものはどれですか。", options:["金属製の調理器具の消毒に最も適している","野菜の消毒には100ppmの濃度で使用する","ノロウイルスの消毒には200ppm以上の濃度が必要である","使用後は水で洗い流す必要はない"], correctAnswer:2, explanation:"ノロウイルスの消毒には200ppm以上（嘔吐物は1000ppm以上）が必要です。金属には腐食性があり不向きです。", keywords:[{ja:"次亜塩素酸ナトリウム",reading:"じあえんそさんなとりうむ",my:"ဆိုဒီယမ်ဟိုက်ပိုကလိုရိုက်"}] },
  { id:"h004", category:"hygiene", type:"academic", question:"食品衛生法に基づく営業許可は、誰が交付しますか。", options:["都道府県知事","厚生労働大臣","市区町村長","保健所長"], correctAnswer:3, explanation:"飲食店の営業許可は、店舗所在地を管轄する保健所長が交付します。", keywords:[{ja:"営業許可",reading:"えいぎょうきょか",my:"စီးပွားရေးလုပ်ကိုင်ခွင့်"},{ja:"保健所",reading:"ほけんじょ",my:"ကျန်းမာရေးဌာန"}] },
  { id:"h005", category:"hygiene", type:"academic", question:"食中毒菌の増殖条件として、正しいものはどれですか。", options:["ほとんどの食中毒菌は10℃以下では増殖しない","食中毒菌は乾燥した環境で最もよく増殖する","食中毒菌の増殖には光が必要である","食中毒菌は酸性の環境で最もよく増殖する"], correctAnswer:0, explanation:"食中毒菌の多くは10℃以下で増殖が抑制されます。「つけない・増やさない・やっつける」が予防の三原則です。", keywords:[{ja:"食中毒菌",reading:"しょくちゅうどくきん",my:"အစားအစာ အဆိပ်သင့်ပိုး"},{ja:"増殖",reading:"ぞうしょく",my:"ပွားများခြင်း"}] },
  { id:"h006", category:"hygiene", type:"academic", question:"アレルゲン表示が義務付けられている特定原材料はいくつですか。", options:["5品目","7品目","8品目","28品目"], correctAnswer:2, explanation:"特定原材料（表示義務）は、えび、かに、くるみ、小麦、そば、卵、乳、落花生の8品目です。", keywords:[{ja:"特定原材料",reading:"とくていげんざいりょう",my:"သတ်မှတ်ထားသော ကုန်ကြမ်းပစ္စည်းများ"}] },
  { id:"h007", category:"hygiene", type:"practical", question:"従業員が嘔吐した場合、最初に行うべき対応はどれですか。", options:["すぐに嘔吐物を拭き取る","嘔吐した従業員を隔離し、周囲の人を遠ざける","保健所に電話する","アルコールで消毒する"], correctAnswer:1, explanation:"まず従業員を隔離し周囲の人を遠ざけます。アルコールはノロウイルスには効果がありません。次亜塩素酸ナトリウム1000ppm以上で消毒します。", keywords:[{ja:"嘔吐",reading:"おうと",my:"အန်ခြင်း"},{ja:"隔離",reading:"かくり",my:"သီးသန့်ခွဲထုတ်ခြင်း"}] },
  { id:"h008", category:"hygiene", type:"academic", question:"黄色ブドウ球菌の毒素の特徴として、正しいものはどれですか。", options:["低温で無毒化される","加熱しても分解されない","酸性で分解される","アルコールで無効化できる"], correctAnswer:1, explanation:"黄色ブドウ球菌のエンテロトキシンは耐熱性が高く、100℃30分の加熱でも分解されません。手指の傷が主な感染源です。", keywords:[{ja:"黄色ブドウ球菌",reading:"おうしょくぶどうきゅうきん",my:"ရွှေရောင်စတက်ဖိုလိုကိုးကပ်စ်"}] },
  { id:"h009", category:"hygiene", type:"practical", question:"冷蔵庫の温度が8℃に上昇していた場合の対応として適切なものは。", options:["食材の状態を確認し問題なければ使う","設定温度を下げ、食材の状態を確認・記録し上司に報告する","すべての食材を廃棄する","翌日まで様子を見る"], correctAnswer:1, explanation:"温度異常発見時は設定温度を確認・調整し、保管食材の状態を確認・記録、上司に報告します。", keywords:[{ja:"温度管理",reading:"おんどかんり",my:"အပူချိန်ထိန်းချုပ်ခြင်း"}] },
  { id:"h010", category:"hygiene", type:"academic", question:"交差汚染を防止する最も適切な対策はどれですか。", options:["生肉用と野菜用のまな板を色分けして使い分ける","食材を同じ冷蔵庫の同じ棚に保管する","調理後に手洗いすればよい","まな板を水で流してから別の食材を切る"], correctAnswer:0, explanation:"交差汚染防止には食材ごとに調理器具を使い分けます。まな板や包丁を色分けし用途別に管理します。", keywords:[{ja:"交差汚染",reading:"こうさおせん",my:"ကူးစက်ညစ်ညမ်းခြင်း"}] },
  { id:"h011", category:"hygiene", type:"academic", question:"カンピロバクター食中毒の主な原因はどれですか。", options:["牛肉の生食","鶏肉の加熱不足","貝類の生食","野菜の洗浄不足"], correctAnswer:1, explanation:"カンピロバクター食中毒は鶏肉の加熱不足や生食が主な原因です。潜伏期間は2〜5日です。", keywords:[{ja:"カンピロバクター",reading:"かんぴろばくたー",my:"ကမ်ပီလိုဘတ်တာ"}] },

  { id:"c001", category:"cooking", type:"academic", question:"魚の鮮度を見分ける方法として、正しいものはどれですか。", options:["目が白く濁っているものが新鮮","えらが鮮やかな赤色のものが新鮮","身を押すと跡が残るものが新鮮","表面が乾燥しているものが新鮮"], correctAnswer:1, explanation:"新鮮な魚はえらが鮮やかな赤色で、目が透明で澄んでおり、身に弾力があります。", keywords:[{ja:"鮮度",reading:"せんど",my:"လတ်ဆတ်မှု"}] },
  { id:"c002", category:"cooking", type:"academic", question:"「ブランチング」とは何ですか。", options:["食材を油で素揚げすること","食材を短時間ゆでて冷水にとること","食材を塩水に漬けること","食材を低温で長時間加熱すること"], correctAnswer:1, explanation:"ブランチングは短時間ゆでた後すぐに冷水にとる調理法で、色の鮮やかさを保ち酵素の働きを止めます。", keywords:[{ja:"ブランチング",reading:"ぶらんちんぐ",my:"အနည်းငယ်ပြုတ်ပြီး အအေးရေစိမ်ခြင်း"}] },
  { id:"c003", category:"cooking", type:"academic", question:"揚げ油の交換時期の目安として正しいものはどれですか。", options:["色が薄くなったとき","泡が消えにくく粘りが出てきたとき","油の量が半分になったとき","使用回数が3回を超えたとき"], correctAnswer:1, explanation:"泡立ちが消えにくい、粘りが出る、色が濃くなる、嫌な臭いがする場合は油を交換します。", keywords:[{ja:"揚げ油",reading:"あげあぶら",my:"ကြော်ဆီ"}] },
  { id:"c004", category:"cooking", type:"academic", question:"先入れ先出し（FIFO）の目的として最も適切なものはどれですか。", options:["在庫数量を正確に把握するため","食材の鮮度を保ち廃棄ロスを減らすため","仕入れコストを削減するため","調理作業を効率化するため"], correctAnswer:1, explanation:"FIFOは先に仕入れた食材を先に使い、鮮度を保ち期限切れによる廃棄ロスを最小限にする管理方法です。", keywords:[{ja:"先入れ先出し",reading:"さきいれさきだし",my:"အရင်ဝင်အရင်ထွက် (FIFO)"}] },
  { id:"c005", category:"cooking", type:"academic", question:"真空調理法（スーヴィード）の特徴として正しいものはどれですか。", options:["高温短時間で加熱する","食材を真空パックし低温で長時間加熱する","食材の水分を抜いて保存性を高める","高圧で食材を柔らかくする"], correctAnswer:1, explanation:"真空調理法は食材を真空パックし50〜85℃程度の低温で長時間加熱する方法です。", keywords:[{ja:"真空調理法",reading:"しんくうちょうりほう",my:"လေဟာနည်းဖြင့် ချက်ပြုတ်ခြင်း"}] },
  { id:"c006", category:"cooking", type:"practical", question:"新人に包丁の持ち方を指導する際、最も重要なポイントはどれですか。", options:["できるだけ刃先に近い部分を持つ","親指と人差し指で刃元を挟むように持つ","力を入れて強く握る","反対の手で持つ練習をさせる"], correctAnswer:1, explanation:"包丁は親指と人差し指で刃元を挟むように持ち、残りの指で柄を握ります。安定した操作と安全性が高まります。", keywords:[{ja:"包丁",reading:"ほうちょう",my:"ဓား"}] },

  { id:"s001", category:"service", type:"academic", question:"クレーム対応の基本手順として最も適切なものはどれですか。", options:["すぐに値引きを提案する","まず謝罪し、お客様の話を最後まで傾聴する","責任者が来るまで対応しない","他のお客様の前で事情を聞く"], correctAnswer:1, explanation:"クレーム対応は①謝罪→②傾聴→③事実確認→④解決策提案→⑤再発防止の流れが基本です。", keywords:[{ja:"クレーム対応",reading:"くれーむたいおう",my:"တိုင်ကြားချက်ကိုင်တွယ်ခြင်း"},{ja:"傾聴",reading:"けいちょう",my:"စေ့စေ့နားထောင်ခြင်း"}] },
  { id:"s002", category:"service", type:"academic", question:"食物アレルギーの申告への対応として最も適切なものはどれですか。", options:["アレルギー対応メニューを出す","具体的なアレルゲンを確認し調理担当に伝える","「大丈夫です」と安心させる","別の店を勧める"], correctAnswer:1, explanation:"命に関わるため、具体的なアレルゲンを確認し調理担当者に正確に伝えることが最重要です。", keywords:[{ja:"食物アレルギー",reading:"しょくもつあれるぎー",my:"အစားအစာ ဓာတ်မတည့်ခြင်း"}] },
  { id:"s003", category:"service", type:"academic", question:"未成年者へのお酒の提供について正しいものはどれですか。", options:["保護者と一緒なら提供可","少量なら提供可","いかなる場合も提供不可","本人が20歳と申告すれば提供可"], correctAnswer:2, explanation:"未成年者飲酒禁止法により20歳未満への酒類提供はいかなる場合も禁止です。年齢確認を徹底します。", keywords:[{ja:"未成年者",reading:"みせいねんしゃ",my:"အရွယ်မရောက်သူ"}] },
  { id:"s004", category:"service", type:"academic", question:"電話予約で確認すべき項目に含まれないものはどれですか。", options:["来店日時と人数","お客様の年収","お名前と連絡先","アレルギーの有無"], correctAnswer:1, explanation:"予約では来店日時、人数、名前、連絡先、アレルギーの有無等を確認します。プライベートな情報は聞きません。", keywords:[{ja:"予約",reading:"よやく",my:"ကြိုတင်မှာယူခြင်း"}] },
  { id:"s005", category:"service", type:"practical", question:"満席時の来店客への最も適切な対応はどれですか。", options:["「満席です」とだけ伝える","待ち時間の目安を伝え、待つか確認する","他の店を紹介する","無言で首を横に振る"], correctAnswer:1, explanation:"お詫びし、待ち時間の目安を伝え待つか確認します。待つ場合は待合スペースへ案内します。", keywords:[{ja:"満席",reading:"まんせき",my:"ထိုင်ခုံပြည့်နေသည်"}] },
  { id:"s006", category:"service", type:"practical", question:"新人の接客指導で最も効果的な方法はどれですか。", options:["マニュアルを渡して読ませる","見学→実践→フィードバックの流れ","最初から一人で接客させる","動画を見せるだけ"], correctAnswer:1, explanation:"効果的な指導は①見学②実践③フィードバックの流れ。OJT（On the Job Training）の基本です。", keywords:[{ja:"指導",reading:"しどう",my:"လမ်းညွှန်သင်ကြားခြင်း"}] },
  { id:"s007", category:"service", type:"academic", question:"料理に異物混入の訴えがあった場合、最初にすべきことは。", options:["原因を調べてから対応","直ちにお詫びし料理を下げる","「ありえません」と否定する","すぐに代わりの料理を出す"], correctAnswer:1, explanation:"異物混入の訴えにはまず直ちにお詫びし料理を下げます。安全を優先し不快な思いにお詫びします。", keywords:[{ja:"異物混入",reading:"いぶつこんにゅう",my:"အစိမ်းခန္ဓာ ရောနှောခြင်း"}] },
  { id:"s008", category:"service", type:"academic", question:"「ホスピタリティ」の説明として最も適切なものはどれですか。", options:["マニュアル通りに正確にサービスすること","お客様の状況を察し期待を超えるおもてなしをすること","お客様の要望にすべて従うこと","早くサービスを提供すること"], correctAnswer:1, explanation:"ホスピタリティとはお客様の状況や気持ちを察しマニュアルを超えた心からのおもてなしです。", keywords:[{ja:"ホスピタリティ",reading:"ほすぴたりてぃ",my:"ဧည့်ဝတ်ပြုခြင်း စိတ်ဓာတ်"}] },
  { id:"s009", category:"service", type:"academic", question:"原料原産地表示について正しいものはどれですか。", options:["すべての食材の原産地表示義務がある","聞かれた場合に正確に答えられるようにする","外食店に表示義務は一切ない","肉類のみ義務がある"], correctAnswer:1, explanation:"外食店では質問に正確に答えられるよう準備が必要です。米は原産地情報の伝達が義務付けられています。", keywords:[{ja:"原料原産地",reading:"げんりょうげんさんち",my:"ကုန်ကြမ်းမူလထုတ်လုပ်ရာဒေသ"}] },

  { id:"o001", category:"operations", type:"academic", question:"FLコストの適正比率として一般的に言われるのはどれですか。", options:["売上高の40〜50%","売上高の55〜65%","売上高の70〜80%","売上高の30〜40%"], correctAnswer:1, explanation:"FLコスト（原材料費＋人件費）は売上高の55〜65%が適正。F=30〜35%、L=25〜30%が目安です。", keywords:[{ja:"FLコスト",reading:"えふえるこすと",my:"အစားအစာနှင့်လုပ်သားကုန်ကျစရိတ်"}] },
  { id:"o002", category:"operations", type:"academic", question:"損益分岐点売上高の計算式として正しいものはどれですか。", options:["固定費÷変動費率","固定費÷（1−変動費率）","（固定費+変動費）÷売上高","売上高×利益率"], correctAnswer:1, explanation:"損益分岐点売上高＝固定費÷（1−変動費率）。利益がゼロになる売上高です。", keywords:[{ja:"損益分岐点",reading:"そんえきぶんきてん",my:"အရှုံးအမြတ်ချိန်ခွင်မျှမှတ်"},{ja:"固定費",reading:"こていひ",my:"ပုံသေကုန်ကျစရိတ်"}] },
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
];

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
  {ja:"鮮度",reading:"せんど",my:"လတ်ဆတ်မှု",cat:"cooking"},
  {ja:"下処理",reading:"したしょり",my:"ကြိုတင်ပြင်ဆင်ခြင်း",cat:"cooking"},
  {ja:"包丁",reading:"ほうちょう",my:"ဓား",cat:"cooking"},
  {ja:"揚げる",reading:"あげる",my:"ဆီကြော်ခြင်း",cat:"cooking"},
  {ja:"煮る",reading:"にる",my:"ပြုတ်ခြင်း",cat:"cooking"},
  {ja:"蒸す",reading:"むす",my:"ပေါင်းခြင်း",cat:"cooking"},
  {ja:"焼く",reading:"やく",my:"ကင်ခြင်း",cat:"cooking"},
  {ja:"クレーム",reading:"くれーむ",my:"တိုင်ကြားချက်",cat:"service"},
  {ja:"予約",reading:"よやく",my:"ကြိုတင်မှာယူခြင်း",cat:"service"},
  {ja:"会計",reading:"かいけい",my:"ငွေရှင်းခြင်း",cat:"service"},
  {ja:"満席",reading:"まんせき",my:"ထိုင်ခုံပြည့်နေသည်",cat:"service"},
  {ja:"接客",reading:"せっきゃく",my:"ဧည့်ခံခြင်း",cat:"service"},
  {ja:"おもてなし",reading:"おもてなし",my:"ဂုဏ်ပြုဧည့်ခံခြင်း",cat:"service"},
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
  {ja:"ABC分析",reading:"えーびーしーぶんせき",my:"ABC ခွဲခြမ်းစိတ်ဖြာမှု",cat:"operations"},
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function ProgressBar({ value, max, color = "bg-amber-500" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function HeaderBar({ title, onBack, right }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      {onBack && <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft size={20} /></button>}
      <h2 className="flex-1 font-medium text-gray-800 text-base">{title}</h2>
      {right}
    </div>
  );
}

function HomeScreen({ onNavigate, stats }) {
  const catKeys = Object.keys(CATEGORIES);
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #FFF1F2 100%)" }}>
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md"><Sparkles size={20} className="text-white" /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">外食業 特定技能2号</h1>
            <p className="text-xs text-gray-500" style={{ fontFamily: "'Padauk', sans-serif" }}>စားသောက်ဆိုင်လုပ်ငန်း ကျွမ်းကျင်မှု အဆင့် ၂</p>
          </div>
        </div>
      </div>

      {stats.totalAnswered > 0 && (
        <div className="mx-5 mb-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">学習の進捗 / လေ့လာမှု တိုးတက်မှု</span>
            <span className="text-sm font-bold text-amber-600">{stats.totalCorrect}/{stats.totalAnswered}</span>
          </div>
          <ProgressBar value={stats.totalCorrect} max={stats.totalAnswered} />
          <p className="text-xs text-gray-400 mt-1.5">正答率 {stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0}%</p>
        </div>
      )}

      <div className="px-5 mb-3">
        <h3 className="text-sm font-semibold text-gray-600 mb-0.5">分野別クイズ / ဘာသာရပ်အလိုက် ပဟေဋ္ဌိ</h3>
        <p className="text-xs text-gray-400">카테고리를 선택하세요</p>
      </div>
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        {catKeys.map(key => {
          const cat = CATEGORIES[key];
          const Icon = cat.icon;
          const catQ = QUESTIONS.filter(q => q.category === key);
          const answered = stats.byCategory[key]?.answered || 0;
          const correct = stats.byCategory[key]?.correct || 0;
          return (
            <button key={key} onClick={() => onNavigate("quiz", key)} className={`p-4 rounded-2xl ${cat.colorLight} border ${cat.colorBorder} text-left transition-all active:scale-95 hover:shadow-md`}>
              <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center mb-2 shadow-sm`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className={`font-bold text-sm ${cat.colorText}`}>{cat.name_ja}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
              <p className="text-xs text-gray-400 mt-0.5">{cat.points}点配点</p>
              {answered > 0 && <p className="text-xs text-gray-400 mt-1">{correct}/{answered} 正解</p>}
            </button>
          );
        })}
      </div>

      <div className="px-5 mb-3">
        <h3 className="text-sm font-semibold text-gray-600">その他の学習 / အခြားလေ့လာမှုများ</h3>
      </div>
      <div className="px-5 flex flex-col gap-3 pb-24">
        <button onClick={() => onNavigate("mock")} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-98 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm"><Clock size={20} className="text-white" /></div>
          <div className="text-left flex-1">
            <p className="font-bold text-sm text-gray-800">模擬試験モード</p>
            <p className="text-xs text-gray-500">本番形式55問・70分タイマー</p>
          </div>
          <ArrowRight size={16} className="text-gray-300" />
        </button>
        <button onClick={() => onNavigate("vocab")} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-98 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-teal-500 flex items-center justify-center shadow-sm"><BookOpen size={20} className="text-white" /></div>
          <div className="text-left flex-1">
            <p className="font-bold text-sm text-gray-800">単語帳</p>
            <p className="text-xs text-gray-500">日本語 ↔ ミャンマー語</p>
          </div>
          <ArrowRight size={16} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}

function QuizScreen({ category, onBack, onUpdateStats }) {
  const cat = CATEGORIES[category];
  const Icon = cat.icon;
  const questions = useMemo(() => shuffle(QUESTIONS.filter(q => q.category === category)), [category]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const total = questions.length;

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    setShowExplanation(true);
    const isCorrect = i === q.correctAnswer;
    if (isCorrect) setScore(s => s + 1);
    onUpdateStats(category, isCorrect);
  };

  const handleNext = () => {
    if (idx + 1 >= total) { setDone(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setShowExplanation(false);
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 65;
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderBar title={`${cat.name_ja} 結果`} onBack={onBack} />
        <div className="flex flex-col items-center px-6 pt-10">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${passed ? "bg-emerald-100" : "bg-rose-100"}`}>
            {passed ? <Trophy size={40} className="text-emerald-600" /> : <RotateCcw size={40} className="text-rose-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{score}/{total} 正解</h2>
          <p className={`text-lg font-semibold ${passed ? "text-emerald-600" : "text-rose-600"}`}>{pct}% — {passed ? "合格ライン達成！" : "もう少し頑張りましょう"}</p>
          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "'Padauk', sans-serif" }}>{passed ? "အောင်မြင်ပါသည်!" : "ထပ်ကြိုးစားပါ!"}</p>
          <div className="w-full mt-6 flex gap-3">
            <button onClick={onBack} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">ホームに戻る</button>
            <button onClick={() => { setIdx(0); setSelected(null); setShowExplanation(false); setScore(0); setDone(false); }} className={`flex-1 py-3 rounded-xl text-sm font-medium text-white ${cat.color}`}>もう一度</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar title={cat.name_ja} onBack={onBack} right={<span className="text-sm text-gray-500 font-medium">{idx + 1}/{total}</span>} />
      <div className="px-4 pt-3">
        <ProgressBar value={idx + 1} max={total} color={cat.color} />
      </div>
      <div className="px-4 pt-4 pb-32">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${cat.colorLight} ${cat.colorText} font-medium`}>{q.type === "academic" ? "学科" : "実技"}</span>
            <span className="text-xs text-gray-400">Q{idx + 1}</span>
          </div>
          <p className="text-base font-medium text-gray-900 leading-relaxed">{q.question}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => {
            let cls = "bg-white border-gray-200 text-gray-800";
            if (selected !== null) {
              if (i === q.correctAnswer) cls = "bg-emerald-50 border-emerald-400 text-emerald-800";
              else if (i === selected && i !== q.correctAnswer) cls = "bg-rose-50 border-rose-400 text-rose-800";
              else cls = "bg-gray-50 border-gray-100 text-gray-400";
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${cls} ${selected === null ? "active:scale-98 hover:border-gray-300" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${selected !== null && i === q.correctAnswer ? "bg-emerald-500 border-emerald-500 text-white" : selected === i && i !== q.correctAnswer ? "bg-rose-500 border-rose-500 text-white" : "border-gray-300 text-gray-500"}`}>
                    {selected !== null && i === q.correctAnswer ? <Check size={14} /> : selected === i && i !== q.correctAnswer ? <X size={14} /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-amber-600" />
              <span className="text-sm font-bold text-amber-700">解説</span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed">{q.explanation}</p>
            {q.keywords && q.keywords.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-xs font-semibold text-amber-600 mb-1.5">重要用語 / အရေးကြီးသော စကားလုံးများ</p>
                {q.keywords.map((kw, ki) => (
                  <div key={ki} className="flex items-baseline gap-2 text-xs mb-1">
                    <span className="font-bold text-gray-800">{kw.ja}</span>
                    <span className="text-gray-400">({kw.reading})</span>
                    {kw.my && <span className="text-amber-700" style={{ fontFamily: "'Padauk', sans-serif" }}>{kw.my}</span>}
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleNext} className={`w-full mt-4 py-3 rounded-xl text-sm font-medium text-white ${cat.color} active:scale-98 transition-transform`}>
              {idx + 1 >= total ? "結果を見る" : "次の問題へ"} <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MockExamScreen({ onBack, onUpdateStats }) {
  const allQ = useMemo(() => {
    const academic = shuffle(QUESTIONS.filter(q => q.type === "academic")).slice(0, 35);
    const practical = shuffle(QUESTIONS.filter(q => q.type === "practical")).slice(0, 20);
    return shuffle([...academic, ...practical]).slice(0, Math.min(QUESTIONS.length, 40));
  }, []);

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

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleSubmit = () => {
    setSubmitted(true);
    clearInterval(timerRef.current);
    allQ.forEach((q, i) => {
      if (answers[i] !== undefined) {
        onUpdateStats(q.category, answers[i] === q.correctAnswer);
      }
    });
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderBar title="模擬試験" onBack={onBack} />
        <div className="flex flex-col items-center px-6 pt-12">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4"><Clock size={36} className="text-emerald-600" /></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">模擬試験モード</h2>
          <p className="text-sm text-gray-500 text-center mb-1">本番と同じ形式で練習しましょう</p>
          <p className="text-xs text-gray-400 text-center mb-6" style={{ fontFamily: "'Padauk', sans-serif" }}>အစစ်အမှန်စာမေးပွဲပုံစံဖြင့် လေ့ကျင့်ပါ</p>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 w-full mb-6 shadow-sm">
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">問題数</span><span className="font-bold">{allQ.length}問</span></div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">制限時間</span><span className="font-bold">70分</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">合格基準</span><span className="font-bold text-emerald-600">65%以上</span></div>
          </div>
          <button onClick={() => setStarted(true)} className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-medium text-sm active:scale-98 transition-transform shadow-sm">試験を開始する</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    let correct = 0;
    allQ.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const pct = Math.round((correct / allQ.length) * 100);
    const passed = pct >= 65;
    const byCat = {};
    allQ.forEach((q, i) => {
      if (!byCat[q.category]) byCat[q.category] = { total: 0, correct: 0 };
      byCat[q.category].total++;
      if (answers[i] === q.correctAnswer) byCat[q.category].correct++;
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderBar title="模擬試験 結果" onBack={onBack} />
        <div className="flex flex-col items-center px-5 pt-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${passed ? "bg-emerald-100" : "bg-rose-100"}`}>
            {passed ? <Trophy size={40} className="text-emerald-600" /> : <RotateCcw size={40} className="text-rose-600" />}
          </div>
          <h2 className="text-2xl font-bold">{correct}/{allQ.length}</h2>
          <p className={`text-lg font-bold ${passed ? "text-emerald-600" : "text-rose-600"}`}>{pct}% — {passed ? "合格！" : "不合格"}</p>
          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "'Padauk', sans-serif" }}>{passed ? "အောင်မြင်ပါသည်! ဂုဏ်ယူပါတယ်!" : "ထပ်ကြိုးစားပါ!"}</p>

          <div className="w-full mt-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3">分野別スコア</h3>
            {Object.entries(byCat).map(([key, val]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{CATEGORIES[key].name_ja}</span>
                  <span className="font-bold">{val.correct}/{val.total}</span>
                </div>
                <ProgressBar value={val.correct} max={val.total} color={CATEGORIES[key].color} />
              </div>
            ))}
          </div>
          <button onClick={onBack} className="w-full mt-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">ホームに戻る</button>
        </div>
      </div>
    );
  }

  const q = allQ[idx];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <span className="text-sm font-medium text-gray-600">{idx + 1}/{allQ.length}</span>
        <span className={`text-sm font-bold font-mono ${timeLeft < 300 ? "text-rose-600" : "text-gray-700"}`}>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
        <button onClick={handleSubmit} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">提出</button>
      </div>
      <div className="px-4 pt-2"><ProgressBar value={idx + 1} max={allQ.length} color="bg-emerald-500" /></div>
      <div className="px-4 pt-4 pb-24">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorText} font-medium`}>{CATEGORIES[q.category].name_ja}</span>
          <p className="text-base font-medium text-gray-900 leading-relaxed mt-3">{q.question}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setAnswers(a => ({ ...a, [idx]: i }))} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[idx] === i ? `${CATEGORIES[q.category].colorLight} ${CATEGORIES[q.category].colorBorder}` : "bg-white border-gray-200"} active:scale-98`}>
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${answers[idx] === i ? `${CATEGORIES[q.category].color} border-transparent text-white` : "border-gray-300 text-gray-500"}`}>{String.fromCharCode(65 + i)}</span>
                <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-30">前へ</button>
          {idx + 1 < allQ.length ? (
            <button onClick={() => setIdx(i => i + 1)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium active:scale-98 transition-transform">次へ</button>
          ) : (
            <button onClick={handleSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold active:scale-98 transition-transform">提出する</button>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div className="min-h-screen bg-gray-50">
        <HeaderBar title="フラッシュカード" onBack={() => setFlashMode(false)} right={<span className="text-sm text-gray-500">{flashIdx + 1}/{shuffled.length}</span>} />
        <div className="px-5 pt-8 flex flex-col items-center">
          <button onClick={() => setFlipped(f => !f)} className="w-full max-w-sm aspect-[3/2] bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-6 active:scale-98 transition-transform">
            {!flipped ? (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-2">{card.ja}</p>
                <p className="text-xs text-gray-400">タップして答えを見る</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-900 mb-1">{card.ja}</p>
                <p className="text-sm text-gray-500 mb-2">{card.reading}</p>
                <p className="text-lg text-amber-700 font-medium" style={{ fontFamily: "'Padauk', sans-serif" }}>{card.my}</p>
              </>
            )}
          </button>
          <div className="flex gap-3 mt-6 w-full max-w-sm">
            <button onClick={() => { setFlashIdx(i => Math.max(0, i - 1)); setFlipped(false); }} disabled={flashIdx === 0} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-30">前へ</button>
            <button onClick={() => { setFlashIdx(i => Math.min(shuffled.length - 1, i + 1)); setFlipped(false); }} disabled={flashIdx >= shuffled.length - 1} className="flex-1 py-3 bg-teal-500 text-white rounded-xl text-sm font-medium active:scale-98 disabled:opacity-30">次へ</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar title="単語帳" onBack={onBack} right={
        <button onClick={() => { setFlashMode(true); setFlashIdx(0); setFlipped(false); }} className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded-lg font-medium">カード</button>
      } />
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {[{ k: "all", l: "すべて" }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ k, l: v.name_ja }))].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${filter === f.k ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"}`}>{f.l}</button>
        ))}
      </div>
      <div className="px-4 flex gap-4 mb-3">
        <label className="flex items-center gap-1.5 text-xs text-gray-500"><input type="checkbox" checked={showReading} onChange={e => setShowReading(e.target.checked)} className="rounded" /> 読み仮名</label>
        <label className="flex items-center gap-1.5 text-xs text-gray-500"><input type="checkbox" checked={showMyanmar} onChange={e => setShowMyanmar(e.target.checked)} className="rounded" /> ミャンマー語</label>
      </div>
      <div className="px-4 pb-24 flex flex-col gap-2">
        {filtered.map((v, i) => (
          <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-gray-900">{v.ja}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES[v.cat]?.colorLight || "bg-gray-100"} ${CATEGORIES[v.cat]?.colorText || "text-gray-600"}`}>{CATEGORIES[v.cat]?.name_ja}</span>
            </div>
            {showReading && <p className="text-xs text-gray-400 mt-0.5">{v.reading}</p>}
            {showMyanmar && <p className="text-sm text-amber-700 mt-1" style={{ fontFamily: "'Padauk', sans-serif" }}>{v.my}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [quizCategory, setQuizCategory] = useState(null);
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0, byCategory: {} });

  const handleNavigate = (s, cat) => {
    setScreen(s);
    if (cat) setQuizCategory(cat);
  };

  const handleUpdateStats = useCallback((category, isCorrect) => {
    setStats(prev => {
      const byCat = { ...prev.byCategory };
      if (!byCat[category]) byCat[category] = { answered: 0, correct: 0 };
      byCat[category] = { answered: byCat[category].answered + 1, correct: byCat[category].correct + (isCorrect ? 1 : 0) };
      return { totalAnswered: prev.totalAnswered + 1, totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0), byCategory: byCat };
    });
  }, []);

  const goHome = () => { setScreen("home"); setQuizCategory(null); };

  switch (screen) {
    case "quiz": return <QuizScreen category={quizCategory} onBack={goHome} onUpdateStats={handleUpdateStats} />;
    case "mock": return <MockExamScreen onBack={goHome} onUpdateStats={handleUpdateStats} />;
    case "vocab": return <VocabScreen onBack={goHome} />;
    default: return <HomeScreen onNavigate={handleNavigate} stats={stats} />;
  }
}
