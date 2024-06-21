import Layout from "@/components/Layout"
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Center, Divider, Heading, Image, Input, ListItem, OrderedList, Text } from "@chakra-ui/react"

export default function Home() {
  return (
    <>
      <div className="flex flex-col w-full min-h-screen space-y-2.5 p-3">
        <Layout flex={true}>
          <Input placeholder="検索したいワードを入力..." />
          <Button colorScheme="teal" className="ml-2.5">検索</Button>
        </Layout>
        <Layout>
          <Alert status="warning" className="rounded-md mb-3">
            <AlertIcon />
            <AlertTitle>この記事は投稿されてから3年以上が経過しています</AlertTitle>
          </Alert>
        </Layout>
        <div className="space-y-[30px]">
          <Layout>
            <Center className="flex flex-col">
              <Image src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi0Wu9z6WTec80O1qqHWaIO7EqFqmeOtNqtgD6Isczo9T6DLjVTGRS_qvNLU9QNXI0IT15VkC3ssKM5dLveBSWNiBPPz427_dVgBAgedt8b5GBffS-YZ5UCMhwXE3navyXsKC0FlUGWfOS0/s800/face_smile_man2.png' alt='' className="rounded-md mb-3 max-h-[250px]" />
              <Heading className="mb-2.5">全てを演繹推論で完結させる男</Heading>
              <Text>人はいずれ死ぬ、あなたは人である、つまりあなたはいずれ死ぬ。</Text>
            </Center>
          </Layout>
          <Layout>
            <Heading size="lg" className="mb-2.5">トマトはなぜ赤色なのか</Heading>
            <OrderedList>
              <ListItem>色は物質の特定の特性によって決まる。</ListItem>
              <ListItem>トマトはリコピンという色素を含む。</ListItem>
            </OrderedList>
            <Text className="font-bold my-2.5">トマトはリコピンという色素によって赤色である。</Text>
          </Layout>
          <Layout>
            <Heading size="lg" className="mb-2.5">人はなぜ生まれなぜ死んでいくのか</Heading>
            <OrderedList>
              <ListItem>すべての生物は細胞分裂によって生まれ、最終的には老化と死を迎える。</ListItem>
              <ListItem>人間も生物の一種である。</ListItem>
            </OrderedList>
            <Text className="font-bold my-2.5">人間は細胞分裂によって生まれ、老化と死を迎える。</Text>
          </Layout>
          <Layout>
            <Heading size="lg" className="mb-2.5">AIはなぜ人間に勝てないのか</Heading>
            <OrderedList>
              <ListItem>AIは人間によってプログラムされ、その能力は人間の知識と技術に依存する。</ListItem>
              <ListItem>AIの判断力や創造力は、人間の経験や直感に完全には及ばない。</ListItem>
            </OrderedList>
            <Text className="font-bold my-2.5">AIはその判断力や創造力の限界から、人間に勝てない場合がある。</Text>
          </Layout>
        </div>
      </div>
    </>
  )
}