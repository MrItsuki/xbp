print("あなたは「X Business Program」 に参加したい一年生です。")
print("でもどうしてか、参加するために必要な『デザイン経営論』の課題をぜんぜん提出していませんでした")
print("最後の課題である「最終課題」で挽回し、単位を貰いましょう！")

name = int(input('1,はい　2,いいえ\n'))
#質問の繰り返し方が全くわからない
if name == 1 :
     print("最終課題の内容は「世の中に無さそうな物を作って発表する」というものです")
     print("どんなものを作りますか？")

     second = int(input('1,見たこともない天才的なもの　2,調べたら出てくる投げやりのもの\n'))

     if second == 1:
          print("あなたはそのほかの単位を全て落とすことになったが無事デザイン経営論の単位を貰うことが出来た")
          print("これから始まるX business Programに期待しよう！")
     elif second == 2:
          print("担当の道用先生から心配のメールが来たが、どうにか単位を貰うことが出来た")
          print("これからはしっかりと課題を出すように気を付けてX Business Programに参加しよう！")
     else:
          print("MMキャンパス14階 14011室にいる道用先生に土下座して謝りましょう。")

     
elif name == 2:
     print("残念です。。")
else:
     print("1か2で答えてください")


