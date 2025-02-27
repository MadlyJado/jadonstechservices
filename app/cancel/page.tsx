export default function Cancel() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
        <h1 className="text-3xl font-bold text-red-700">Payment Canceled</h1>
        <p className="mt-2 text-gray-700">Your transaction was not completed.</p>
      </div>
    );
  }
  