import React from 'react';
import { Screen } from '../types';

interface CheckoutProps {
  onNavigate: (screen: Screen) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-10 py-8">
      <nav className="flex mb-8 overflow-x-auto pb-2">
        <ol className="flex items-center whitespace-nowrap min-w-0 gap-2">
          <li className="text-sm">
            <a onClick={() => onNavigate('cart')} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer">
              Giỏ hàng
              <span className="material-symbols-outlined mx-2 text-[16px]">chevron_right</span>
            </a>
          </li>
          <li className="text-sm font-bold text-primary flex items-center">
            Thanh toán
            <span className="material-symbols-outlined mx-2 text-[16px] text-gray-400">chevron_right</span>
          </li>
          <li className="text-sm text-gray-400">
            Hoàn tất
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Phương thức thanh toán</h1>
            <p className="text-gray-600 dark:text-gray-400">Chọn phương thức thanh toán cho đơn hàng của bạn.</p>
          </div>

          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 p-4 rounded-xl text-sm text-green-800 dark:text-green-400 shadow-sm">
            <div className="p-2 bg-green-100 dark:bg-green-800/40 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield_lock</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Thanh toán an toàn</span>
              <span className="opacity-90 text-xs">Mọi giao dịch đều được mã hóa. Chúng tôi không lưu thông tin thẻ của bạn.</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative rounded-xl border-2 border-primary bg-white dark:bg-surface-dark overflow-hidden transition-all shadow-md ring-4 ring-primary/5">
              <label className="flex items-start gap-4 p-5 cursor-pointer w-full">
                <div className="relative flex items-center justify-center mt-1">
                  <input type="radio" name="payment_method" value="online" defaultChecked className="peer h-5 w-5 appearance-none rounded-full border-2 border-gray-300 dark:border-gray-600 checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all" />
                  <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between items-center w-full flex-wrap gap-2">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">Thanh toán online (Thẻ/Chuyển khoản)</span>
                    <div className="flex -space-x-2">
                      <div className="h-6 w-6 rounded-full bg-white border border-gray-100 flex items-center justify-center z-30 shadow-sm text-[8px] font-bold text-blue-800">V</div>
                      <div className="h-6 w-6 rounded-full bg-white border border-gray-100 flex items-center justify-center z-20 shadow-sm text-[8px] font-bold text-red-600">M</div>
                      <div className="h-6 w-6 rounded-full bg-white border border-gray-100 flex items-center justify-center z-10 shadow-sm text-[8px] font-bold text-green-600">B</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thanh toán tức thì qua App Ngân hàng, Thẻ ATM, Visa/Mastercard hoặc Ví điện tử.</p>
                </div>
              </label>
              
              <div className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-background-dark p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Chọn ngân hàng hoặc ví</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {['VCB', 'TCB', 'MB', 'Momo'].map((bank, idx) => (
                    <div key={idx} className="relative group cursor-pointer">
                      <input type="radio" name="bank_option" id={`bank_${bank}`} className="peer sr-only" defaultChecked={idx === 0} />
                      <label htmlFor={`bank_${bank}`} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark peer-checked:border-primary peer-checked:bg-red-50 dark:peer-checked:bg-primary/10 hover:border-primary transition-all h-24 text-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">{bank}</div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{bank === 'Momo' ? 'Momo Wallet' : `${bank} Bank`}</span>
                      </label>
                      <div className="absolute top-2 right-2 hidden peer-checked:block text-primary">
                        <span className="material-symbols-outlined text-[18px] fill-current">check_circle</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <label className="group relative flex items-start gap-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark p-5 cursor-pointer hover:border-primary/50 hover:bg-red-50/50 dark:hover:bg-primary/5 transition-all shadow-sm">
              <div className="relative flex items-center justify-center mt-1">
                <input type="radio" name="payment_method" value="cod" className="peer h-5 w-5 appearance-none rounded-full border-2 border-gray-300 dark:border-gray-600 checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0" />
                <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></span>
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">Thanh toán khi nhận hàng (COD)</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thanh toán tiền mặt khi giao hàng. Áp dụng cho đơn hàng dưới 5.000.000₫.</p>
              </div>
              <div className="text-gray-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
              </div>
            </label>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
            <a onClick={() => onNavigate('cart')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium hover:text-primary hover:underline transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại giỏ hàng
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <div className="sticky top-24 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface-darker flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Đơn hàng</h3>
              <span className="text-xs font-semibold bg-accent text-black px-2 py-1 rounded-md">2 Sản phẩm</span>
            </div>
            <div className="p-5 flex flex-col gap-5 max-h-[350px] overflow-y-auto">
              <div className="flex gap-4 group">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100">
                  <div className="w-full h-full bg-gradient-to-br from-red-200 to-yellow-100 opacity-50"></div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow ring-2 ring-white dark:ring-card-dark z-10">1</span>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">Hộp Quà Phú Quý</h4>
                  <p className="text-xs text-gray-500">Phân loại: Tiêu chuẩn</p>
                  <p className="text-sm font-bold text-primary mt-1">1.250.000₫</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100">
                  <div className="w-full h-full bg-gradient-to-tl from-yellow-200 to-orange-100 opacity-50"></div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow ring-2 ring-white dark:ring-card-dark z-10">1</span>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">Rượu Vang Premium</h4>
                  <p className="text-xs text-gray-500">Dung tích: 750ml</p>
                  <p className="text-sm font-bold text-primary mt-1">2.100.000₫</p>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-4 bg-gray-50 dark:bg-surface-darker border-y border-gray-200 dark:border-white/10">
              <div className="mt-1 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">confirmation_number</span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-300">Mã TET2024 đã dùng! <span className="text-green-600 dark:text-green-400 font-bold">-10%</span></span>
              </div>
            </div>

            <div className="p-6 space-y-3 bg-white dark:bg-card-dark">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Tạm tính</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">3.350.000₫</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Vận chuyển</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">30.000₫</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <div className="flex items-center gap-1">
                  <span>Giảm giá</span>
                  <span className="material-symbols-outlined text-[14px]">help</span>
                </div>
                <span className="font-bold">-335.000₫</span>
              </div>
              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 mt-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Tổng cộng</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-primary tracking-tight">3.045.000₫</span>
                    <span className="text-xs text-gray-500">Đã bao gồm VAT</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-700 hover:brightness-110 text-white py-4 text-base font-bold shadow-lg shadow-red-500/30 dark:shadow-none transition-all transform active:scale-[0.98]">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span>Hoàn Tất Đơn Hàng</span>
              </button>
              <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
                <span className="text-[10px] text-gray-500 font-medium">+ Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
