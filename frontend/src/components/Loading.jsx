const Loading = ({ message = "Carregando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  );
};

export default Loading;
