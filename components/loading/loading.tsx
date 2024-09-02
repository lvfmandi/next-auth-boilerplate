import { FadeLoader } from '@/components/loading/fade-loader';

export const Loading = ({ message }: { message: string }) => {
  return (
    <div className="absolute  flex items-center inset-0 bg-gradient-to-br from-slate-200/80 to-orange-100/80 backdrop-blur-sm z-10">
      <div className="mx-auto max-w-sm flex flex-col items-center justify-center p-4 gap-4">
        <FadeLoader />
        <p className="text-base">
          {message}
          <span className="animate-pulse"> ...</span>
        </p>
      </div>
    </div>
  );
};
