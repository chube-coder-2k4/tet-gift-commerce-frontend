import React from 'react';
import { Screen } from '../types';

interface AuthProps {
  onNavigate: (screen: Screen) => void;
  type: 'login' | 'register';
}

const Auth: React.FC<AuthProps> = ({ onNavigate, type }) => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row relative">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 py-12 lg:p-12 z-10 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-[440px] flex flex-col">
          <div className="mb-10">
            <h1 className="text-gray-900 dark:text-white text-4xl font-bold leading-tight tracking-tight mb-2">
              {type === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal">
              {type === 'login' ? 'Vui lòng nhập thông tin để đăng nhập.' : 'Tham gia cùng chúng tôi để nhận ưu đãi Tết.'}
            </p>
          </div>
          
          <div className="mb-8 p-1 bg-gray-200 dark:bg-surface-darker rounded-xl flex">
            <button 
              onClick={() => onNavigate('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all
                ${type === 'login' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
              `}
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all
                ${type === 'register' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
              `}
            >
              Đăng ký
            </button>
          </div>

          <form className="flex flex-col gap-5">
            {type === 'register' && (
               <label className="flex flex-col w-full group">
               <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Họ và tên</span>
               <div className="relative">
                 <input type="text" className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 text-base transition-all outline-none" placeholder="Nguyễn Văn A" />
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                   <span className="material-symbols-outlined text-[20px]">badge</span>
                 </div>
               </div>
             </label>
            )}
            
            <label className="flex flex-col w-full group">
              <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Email hoặc Tên đăng nhập</span>
              <div className="relative">
                <input type="text" className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 text-base transition-all outline-none" placeholder="example@email.com" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
              </div>
            </label>
            
            <label className="flex flex-col w-full group">
              <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Mật khẩu</span>
              <div className="relative">
                <input type="password" className="bg-white dark:bg-[#200606] border border-gray-300 dark:border-[#4a1212] text-gray-900 dark:text-white placeholder-gray-500/50 dark:placeholder-gray-400/50 focus:border-accent focus:ring-1 focus:ring-accent flex w-full rounded-xl h-12 px-4 pl-11 text-base transition-all outline-none" placeholder="Nhập mật khẩu" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] group-focus-within:text-accent transition-colors pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#a86b6b] hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </div>
              </div>
            </label>

            {type === 'login' && (
              <div className="flex justify-end">
                <a href="#" className="text-primary hover:text-red-700 dark:text-accent dark:hover:text-white text-sm font-medium hover:underline transition-colors">Quên mật khẩu?</a>
              </div>
            )}

            <button type="button" onClick={() => onNavigate('home')} className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-4 bg-primary hover:bg-red-700 text-white text-base font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-2">
              {type === 'login' ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </form>

          <div className="relative py-8 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-[#4a1212]"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 dark:text-[#a86b6b] text-xs font-medium uppercase tracking-wider">Hoặc tiếp tục với</span>
            <div className="flex-grow border-t border-gray-300 dark:border-[#4a1212]"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-300 dark:border-[#4a1212] bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-400 dark:hover:border-white/20 transition-all group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW31eKsFvfUkHYwwnktymeAk941arcVd2QOjJRqfCPqvtsx6K0uwOl0cHdVZCipyT_XTZkC1FXnsKNqogYtuKz-F0qNVGYQclBkzGFEaXzEMO1FugWyvm4E-1_5X5wOuij8RqTGauL6aP58fkkgeGslaqukWL8LIovQqQTV3_ccM-aHO016fVjS0vfZ9L97hG551riCZKQBT7gQrAdGzQa4-OjIHyltpo1ycxKrQq1Iu5RxrSsV8jYlqHcWSORS8TuSvzIRF5p8pE" alt="Google" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="text-gray-700 dark:text-white/90 text-sm font-medium group-hover:text-black dark:group-hover:text-white">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-300 dark:border-[#4a1212] bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-400 dark:hover:border-white/20 transition-all group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4n19aYKfrWTHRS8nwGK_8Lsq90CGZNvg1OHmgM0iXjUxCDt-FJDsW-eelaiVOYzBOZ-CO34V8-hTMclV8dDRTszyn2XW-o3CdxYVtvYAstc9fjupjS3T_z37cK3kthlYXlDF3TGCVR10NQnFhK4XtnlwZrXTxh3MwxVBBwyrLh-elfC-hmBWknQ3N3R3yeIG6hSWkiPF5QavV8RIK9fyd_RA0aG-85HpDQ4PhV7DlcPwYSF-mrv0hfhQZX9vgNxww4s2yhfS9Yj8" alt="Facebook" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="text-gray-700 dark:text-white/90 text-sm font-medium group-hover:text-black dark:group-hover:text-white">Facebook</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block lg:w-1/2 relative bg-black border-l border-gray-200 dark:border-[#4a1212] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: 'radial-gradient(#D70018 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFNAYiX_I1col8ExIs39TajfchjHnC67qFZHo-r_7LmlS74A4q0pEuEMKKsw85Ze1RGQyFCqaWwNjcIq3w1KfHh_nta1DB-9z3SMzGViS_Vv_0RNHE-FsCE9hXOUplWhUDUNUWwYBTjfHeHY4CbCY-sXDRUPVrjR84Ft9jBVJ30yl9EvLl7cdY6KO98590tbg7etYxgJlZGY4cOfVhygwUxarT66wbpdyzQUoo_gO_8lBlG7rDvIJsIKUr30a3cgA4jMxhQGIKBIc" className="w-full h-full object-cover opacity-60 scale-105" alt="Elegant Tet" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-background-dark/20 to-transparent"></div>
          
          <div className="absolute bottom-20 left-16 right-16 text-white z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent font-medium mb-6 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">filter_vintage</span>
              <span className="text-xs uppercase tracking-wider font-bold">Lunar New Year Collection</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 leading-[1.1] text-white drop-shadow-lg">
              Tradition Meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#ffeeb0]">Modern Elegance</span>
            </h2>
            <p className="text-lg text-white/80 font-normal max-w-md mt-4 leading-relaxed">
              Experience the warmth of Tet with our curated selection of premium gifts. Sign in to explore exclusive offers.
            </p>
            <div className="flex gap-2 mt-8">
              <div className="w-8 h-1 bg-accent rounded-full"></div>
              <div className="w-2 h-1 bg-white/30 rounded-full"></div>
              <div className="w-2 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
