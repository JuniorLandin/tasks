import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Image from 'next/image'

import heroImg from '../../public/assets/hero.png'
import { GetStaticProps } from 'next'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebaseConection'

interface HomeProps{
  posts: number;
  comments: number;
}

export default function Home({posts, comments}: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ organize suas tarefas de forma fácil.</title>
      </Head>

       <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt='Logo Tarefas +'
            src={heroImg}
            priority={true}
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br/>
          seus estudos
        </h1>
        <div className={styles.infoContent}>
          <section className={styles.caixa}>
            <span className={styles.box}>+{posts} posts</span>
          </section>
          <section className={styles.caixa}>
            <span className={styles.box}>+{comments} coments</span>
          </section>
        </div>
       </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  //Buscar do banco os números de tarefas e comments e mandar pro componente

  const commentRef = collection(db, 'comments')
  const postRef = collection(db, 'tasks')

  const postSnapshot = await getDocs(postRef)

  const commentSnapshot = await getDocs(commentRef)
  
  return{
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 60,
  }
}