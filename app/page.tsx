"use client";

import { useEffect, useState } from "react";

export default function Home() {

  // =========================
  // state
  // =========================

  const [seconds, setSeconds] = useState(0);
  // 経過秒数

  const [running, setRunning] = useState(false);
  // タイマー動作中か

  const [task, setTask] = useState("");
  // 作業名

  const [usedAI, setUsedAI] = useState(false);
  // AI使用ON/OFF

  const [history, setHistory] = useState<
    {
      task: string;
      time: string;
      usedAI: boolean;
      date: string;
    }[]
  >([]);
  // 履歴

  // =========================
  // タイマー
  // =========================

  useEffect(() => {

    let interval: NodeJS.Timeout;

    if (running) {

      interval = setInterval(() => {

        setSeconds((prev) => prev + 1);

      }, 1000);
    }

    return () => clearInterval(interval);

  }, [running]);

  // =========================
  // 履歴読み込み
  // =========================

  useEffect(() => {

    const savedHistory =
      localStorage.getItem("history");

    if (savedHistory) {

      setHistory(
        JSON.parse(savedHistory)
      );
    }

  }, []);

  // =========================
  // 履歴保存
  // =========================

  useEffect(() => {

    localStorage.setItem(
      "history",
      JSON.stringify(history)
    );

  }, [history]);

  // =========================
  // 秒変換
  // =========================

  const convertToSeconds = (
    timeString: string
  ) => {

    const parts =
      timeString.split(":");

    const hrs = Number(parts[0]);

    const mins = Number(parts[1]);

    const secs = Number(parts[2]);

    return (
      hrs * 3600 +
      mins * 60 +
      secs
    );
  };

  // =========================
  // 作業別集計
  // =========================

  const taskSummary = history.reduce(
    (acc, item) => {

      const currentSeconds =
        convertToSeconds(item.time);

      // 初期化
      if (!acc[item.task]) {

        acc[item.task] = {
          ai: 0,
          manual: 0,
        };

      }

      // AI or 手動 加算
      if (item.usedAI) {

        acc[item.task].ai +=
          currentSeconds;

      } else {

        acc[item.task].manual +=
          currentSeconds;

      }

      return acc;

    },
    {} as Record<
      string,
      {
        ai: number;
        manual: number;
      }
    >
  );

  // =========================
  // 時間フォーマット
  // =========================

  const formatTime = (
    totalSeconds?: number
  ) => {

    const target =
      totalSeconds ?? seconds;

    const hrs = String(
      Math.floor(target / 3600)
    ).padStart(2, "0");

    const mins = String(
      Math.floor((target % 3600) / 60)
    ).padStart(2, "0");

    const secs = String(
      target % 60
    ).padStart(2, "0");

    return `${hrs}:${mins}:${secs}`;
  };

  // =========================
  // UI
  // =========================

  return (

    <main className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="rounded-2xl bg-white p-10 shadow-xl text-center w-[350px]">

        {/* タイトル */}
        <h1 className="text-2xl font-bold mb-6">
          作業タイマー
        </h1>

        {/* 作業名入力 */}
        <input
          type="text"
          placeholder="作業名を入力"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full border rounded-xl p-3 mb-6"
        />

        {/* AI使用 */}
        <label className="flex items-center gap-2 mb-4">

          <input
            type="checkbox"
            checked={usedAI}
            onChange={(e) =>
              setUsedAI(e.target.checked)
            }
          />

          AIを使った

        </label>

        {/* 状態表示 */}
        <p className="mb-2">

          {running
            ? "🟢 作業中"
            : "🔴 停止中"}

        </p>

        {/* 時間 */}
        <div className="text-5xl font-mono mb-8">

          {formatTime()}

        </div>

        {/* ボタン */}
        <div className="flex gap-4 justify-center">

          {/* Start / Stop */}
          <button
            onClick={() => {

              setRunning(!running);

            }}
            className="bg-gray-300 px-6 py-3 rounded-xl"
          >

            {running
              ? "停止"
              : "開始"}

          </button>

          {/* Reset */}
          <button
            onClick={() => {

              setSeconds(0);

              setRunning(false);

            }}
            className="bg-red-300 px-6 py-3 rounded-xl"
          >
            Reset
          </button>

          {/* 記録 */}
          <button
            onClick={() => {

              if (!task) return;

              setHistory([
                ...history,

                {
                  task,

                  time: formatTime(),

                  usedAI,

                  date: new Date().toLocaleString(
                    "ja-JP",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  ),
                },
              ]);

              // リセット

              setSeconds(0);

              setRunning(false);

              setTask("");

              setUsedAI(false);

            }}
            className="bg-blue-300 px-6 py-3 rounded-xl"
          >
            記録
          </button>

        </div>

        {/* 作業別集計 */}
        <div className="mt-8 text-left">

          <h2 className="font-bold mb-2">
            作業別合計
          </h2>

          {Object.entries(taskSummary).map(
            ([taskName, data]) => (

              <div
                key={taskName}
                className="border-b py-3 text-sm"
              >

                <div className="font-medium mb-1">
                  {taskName}
                </div>

                <div className="flex justify-between text-xs">

                  <span>
                    🤖 AI:
                    {" "}
                    {formatTime(data.ai)}
                  </span>

                  <span>
                    👤 手動:
                    {" "}
                    {formatTime(data.manual)}
                  </span>

                </div>

              </div>
            )
          )}

        </div>

        {/* 履歴 */}
        <div className="mt-8 text-left">

          <div className="flex justify-between items-center mb-2">

            <h2 className="font-bold">
              履歴
            </h2>

            <button
              onClick={() => {

                const ok = confirm(
                  "履歴を全削除しますか？"
                );

                if (!ok) return;

                setHistory([]);

                localStorage.removeItem(
                  "history"
                );

              }}
              className="text-xs bg-red-200 px-3 py-1 rounded-lg"
            >
              全削除
            </button>

          </div>

          {history.map((item, index) => (

            <div
              key={index}
              className="border-b py-2 text-sm"
            >

              <div className="text-gray-400 text-xs">

                {item.date}

              </div>

              <div>

                {item.task}
                {" - "}
                {item.time}

                {item.usedAI
                  ? " 🤖 AI使用"
                  : " 👤 手動"}

              </div>

            </div>
          ))}

        </div>

      </div>

    </main>
  );
}