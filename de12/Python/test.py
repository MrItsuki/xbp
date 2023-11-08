from ojichat import OjichatGenerator

# インスタンス生成時にプロパティを渡す
ojichat = OjichatGenerator
result = ojichat.generator()
print(result)

ojichat.reset()
result = ojichat.generator()

for i in range(10):
    print(ojichat.generator(True))

result1 = ojichat.generator()
ojichat.set_props(name="ひかり")
result2 = ojichat.generator()


# 渡せる引数等はdocstringをご覧ください