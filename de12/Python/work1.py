for i in range(3):
    print(i,"人目")
    name=input("名前を教えてください")
    waist=float(input("腹囲の数値を教えて下さい"))
    age=int(input("年齢を教えてください"))

    print(name, "さんは腹囲", waist, "cmで年齢は",age, "才ですね。")

    if waist>=85 and age>=40:
        print(name,"さん、内臓脂肪蓄積注意です")
    else:
        print(name,"さん、腹囲は問題ありません")

