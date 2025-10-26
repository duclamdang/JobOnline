import { useState } from "react";
import { useAppDispatch, useAppSelector } from '@context/hooks';
import { increment, decrement, incrementByAmount } from '@context/counter/counterSlice';

function TailwindTest() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.counter.value);
  const [isToggled, setIsToggled] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Tailwind CSS + Redux Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kiểm tra các tính năng Tailwind và Redux Counter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Counter (Redux)</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {count}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => dispatch(decrement())}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                -1
              </button>
              <button
                onClick={() => dispatch(increment())}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                +1
              </button>
              <button
                onClick={() => dispatch(incrementByAmount(5))}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                +5
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Toggle Switch</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{isToggled ? "Bật" : "Tắt"}</span>
              <button
                onClick={() => setIsToggled(!isToggled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  isToggled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isToggled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Progress Bar</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.abs(count * 5) % 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Progress: {Math.abs(count * 5) % 100}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TailwindTest;