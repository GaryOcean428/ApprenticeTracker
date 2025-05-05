export default function NotFound(): React.JSX.Element {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <h2 className='mb-4 text-2xl font-bold'>404 - Page Not Found</h2>
      <p className='text-gray-600'>The page you are looking for does not exist.</p>
    </div>
  );
}
