import Image from "next/image";

export default function Home() {
  return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 p-6">
            <div className="max-w-3xl w-full text-center">
                    <Image src="/next.svg" alt="logo" width={120} height={24} className="mx-auto dark:invert" />
                            <h1 className="mt-8 text-4xl font-bold">Welcome to Mintrias</h1>
                                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
                                              Project starter — Tailwind aktif. Edit this page to begin building.
                                                      </p>

                                                              <div className="mt-8 flex justify-center gap-3">
                                                                        <a className="px-4 py-2 bg-indigo-600 text-white rounded-md" href="/docs" >Docs</a>
                                                                                  <button
                                                                                              onClick={() => alert("Let's build 🚀")}
                                                                                                          className="px-4 py-2 border border-zinc-300 rounded-md"
                                                                                                                    >
                                                                                                                                Quick demo
                                                                                                                                          </button>
                                                                                                                                                  </div>
                                                                                                                                                        </div>
                                                                                                                                                            </main>
                                                                                                                                                              );
                                                                                                                                                              }