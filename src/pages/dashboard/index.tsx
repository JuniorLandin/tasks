import { GetServerSideProps } from 'next'
import styles from './styles.module.css'
import Head from 'next/head'

import {ChangeEvent, FormEvent, useEffect} from 'react'

import { getSession } from 'next-auth/react'
import { useState } from 'react'
import { Textarea } from '@/components/textarea'

import {FiShare2} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'

//Importanto Banco de dados
import { db } from '@/services/firebaseConection'
import { 
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc
} from 'firebase/firestore'
import Link from 'next/link'

interface HomeProps{
  user: {
    email: string
  }
}

interface TasksProps{
  id: string,
  created: Date,
  public: boolean,
  tasks: string,
  user: string,
}

export default function Dashboard({user}: HomeProps){

  const [input, setInput] = useState("")
  const [publicTask, setPublicTask] = useState(false)
  const [tasks, setTasks] = useState<TasksProps[]>([])

  useEffect(()=> {
    const loadTask = async() => {
      const taskRef = collection(db, 'tasks')

      const q = query(
        taskRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      )
      onSnapshot(q, (snapshot) => {
        let lista = [] as TasksProps[];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tasks: doc.data().tasks,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public
          })
        })
        setTasks(lista)
      })
    }

    loadTask()
  },[user?.email])

  const handleChangePublic = (e: ChangeEvent<HTMLInputElement>) => {

    console.log(e.target.checked)
    setPublicTask(e.target.checked)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if(input === ""){
      alert ("Favor prencher a tarefa")
      return
    }

    try {
      
      await addDoc(collection(db, "tasks"), {
        tasks: input,
        created: new Date(),
        user: user?.email,
        public: publicTask
      })

      setInput("")
      setPublicTask(publicTask)

    } catch (err) {
      console.log(err)
    }


  }

  //Deletar item da lista
  const handleDelete = async(id: string) => {

    const docRef = doc(db, "tasks", id)

    await deleteDoc(docRef)

  }

  const handleShare = async(id: string) => {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    )

    alert("URL copiada com sucesso")
  }

    return(

        <div className={styles.container}>
          <Head>
            <title>Meu painel de tarefas</title>
          </Head>

          <main className={styles.content}>
            <section className={styles.content}>
              <div className={styles.contentForm}>
                <h1 className={styles.title}>Qual sua tarefa?</h1>

                <form onSubmit={handleSubmit}>
                  <Textarea 
                    placeholder='Digite qual é sua tarefa'
                    value={input}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                  />
                  <div className={styles.checkboxArea}>
                    <input 
                      type='checkbox'
                      className={styles.checkbox}
                      checked={publicTask}
                      onChange={handleChangePublic}
                    />
                    <label>Deixar tarefa publica</label>
                  </div>
                  <button className={styles.button} type='submit'>
                    Registrar
                  </button>
                </form>
              </div>
            </section>
               
          
          <section className={styles.taskContainer}>
                <h1>Minhas tarefas</h1>

                  {tasks.map((item) => (

                    <article key={item.id} className={styles.task}>

                      {item.public && (
                        <div className={styles.tagContainer}>
                        <label className={styles.tag}>PUBLICO</label>
                        <button className={styles.shareButton}>
                        <FiShare2
                        size={22}
                        color='#3183ff'
                        onClick={() => handleShare(item.id)}
                        />
                        </button>
                      </div>
                      )}

                    <div className={styles.taskContent}>

                      {item.public ? (
                        <Link href={`/task/${item.id}`}>
                          <p>{item.tasks}</p>
                        </Link>
                      ) : (
                        <p>{item.tasks}</p>
                      )}

                      <button className={styles.trashButton} onClick={() => handleDelete(item.id)}>
                        <FaTrash
                          className={styles.trashButton}
                          size={24}
                          color='#ea3140'
                        />
                      </button>
                    </div>
                  </article>     

                  ))}                

              </section>

              </main>


        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {

  const session = await getSession({req})

  if(!session?.user){
    //Se não tem usuário, redireciona para home
    return{
      redirect:{
        destination: '/',
        permanent: false,
      }
    }
  }

  return{
    props: {
      user: {
        email: session?.user?.email,
      }
    },
  };
};