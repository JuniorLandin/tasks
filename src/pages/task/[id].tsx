import Head from "next/head";
import styles from "./styles.module.css"
import { GetServerSideProps } from "next";
import {ChangeEvent, FormEvent, useState} from 'react'

//Importação banco
import { db } from "@/services/firebaseConection";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
  getDocs,
  deleteDoc,
}
from 'firebase/firestore'
import { Textarea } from "@/components/textarea";
import { useSession } from "next-auth/react";
import { FaTrash } from "react-icons/fa";

interface taskProps{
  item: {
    tasks: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  allComments: commentsProps[]
}

interface commentsProps{
  id: string,
  comment: string,
  taskId: string,
  user: string,
  name: string
}

export default function Task({item, allComments}: taskProps){

  const {data: session} = useSession()
  const [comments, setComments] = useState("")

  const [pushComments, setPushComments] = useState<commentsProps[]>(allComments || [])



  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault()

    if(comments === "") {
      alert ("Favor preencher a tarefa")
      return
    }

    if(!session?.user?.email || !session?.user?.name) return;

    try {
      
      const docRef = await addDoc(collection (db, 'comments'), {
        comment: comments,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId
      })

      const data ={
        id: docRef.id,
        comment: comments,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId
      }

      setPushComments((oldItem)=> [... oldItem, data])

      setComments("")
      console.log(comments)

    } catch (err) {
      console.log(err)
    }

  }

  const handleDelete = async(id: string) => {

    try {
      
      const docRef = doc(db, 'comments', id)
      
      await deleteDoc(docRef)

      const deleteComment = pushComments.filter((item) => item.id !== id)

      setPushComments(deleteComment)
      
    } catch (err) {
      console.log(err)
    }


  }


    return(
        <div className={styles.container}>
            <Head>
              <title>Detalhes da tarefa</title>
            </Head>
            <main className={styles.main}>
              <h1 className={styles.h1text}>Tarefa</h1>
              <article className={styles.task}>
                <p>
                  {item.tasks}
                </p>
              </article>
            </main>

            <section className={styles.comentsContainer}>
              <h2>Deixar comentário</h2>
              <form onSubmit={handleSubmit}>
                <Textarea
                  placeholder="Digite seu comentário"
                  value={comments}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
                />
                <button
                 type="submit"
                 className={styles.button}
                 disabled={!session?.user}
                 >
                  Enviar comentário
                </button>
              </form>
            </section>

            <section className={styles.comentsContainer}>
              <h2>Todos os comentários</h2>
              {pushComments.length === 0 && (
                <span>Nenhum comentário foi encontrado...</span>
              )}

              {pushComments.map((item)=> (
                <article key={item.id} className={styles.comment}>
                  <div className={styles.headComment}>
                    <label className={styles.commentsLabel}>{item.name}</label>
                    {item.user === session?.user?.email && (
                    <button
                     className={styles.buttonTrash}
                     onClick={() => handleDelete(item.id)}>
                      <FaTrash size={18} color="#ea3140"/>
                    </button>
                    )}
                  </div>
                  <p>{item.comment}</p>
                </article>
              ))}
            </section>

        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async({params}) => {

  const id = params?.id as string;

  const docRef = doc(db, "tasks", id)
  const snapshot = await getDoc(docRef)

  const q = query(
    collection(db, "comments"),
    where("taskId", "==", id)
  )

  const snapshotComments = await getDocs(q)

  let allComments: commentsProps[] = []

  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    })
  })
  
  if(snapshot.data() === undefined){
    return{
      redirect:{
        destination: '/',
        permanent: false,
      },
    };
  }

  if(!snapshot.data()?.public){
    return{
      redirect: {
        destination: "/",
        permanent: false
      }
    }
  }

  const milisecond = snapshot.data()?.created?.seconds * 1000

  const task ={
    tasks: snapshot.data()?.tasks,
    public: snapshot.data()?.public,
    created: new Date(milisecond).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,

  }

  return{
    props: {
      item: task,
      allComments: allComments,
    }
  }
}
