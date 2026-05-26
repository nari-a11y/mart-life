/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart,
  Wallet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  User,
  ShoppingBag,
  Milk,
  Cookie,
  IceCream,
  Candy
} from 'lucide-react';

// --- Types ---
type Product = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  imageUrl?: string;
  category: 'drink' | 'snack' | 'etc' | 'personal';
};

type ScreenType = 'INTRO' | 'MISSION_SHOPPING' | 'BALANCE_CHECK' | 'MY_CHOICE' | 'HIDDEN_STAGE' | 'BUDGET_OVER' | 'RESULT';

type ResultType = 'MISSION_COMPLETE' | 'FAILED_MISSION' | 'PERFECT';

// --- Constants ---
const INITIAL_BUDGET = 10000;
const MISSION_TARGETS = {
  drink: 3,
};

const SCREEN_LOCATION: Record<ScreenType, { emoji: string; label: string; bg: string }> = {
  INTRO:            { emoji: '🏫', label: '교실',  bg: 'bg-amber-50' },
  MISSION_SHOPPING: { emoji: '🛒', label: '마트',   bg: 'bg-sky-50'   },
  BALANCE_CHECK:    { emoji: '🛒', label: '마트',   bg: 'bg-sky-50'   },
  MY_CHOICE:        { emoji: '🛒', label: '마트',   bg: 'bg-sky-50'   },
  HIDDEN_STAGE:     { emoji: '🛒', label: '마트',   bg: 'bg-sky-50'   },
  BUDGET_OVER:      { emoji: '💳', label: '계산대', bg: 'bg-orange-50' },
  RESULT:           { emoji: '🏫', label: '교실',  bg: 'bg-amber-50' },
};

const ITEMS: Product[] = [
  { id: 'd1', name: '음료수', price: 2000, emoji: '🥤', imageUrl: '/images/products/시원한 음료수.png', category: 'drink' },
  { id: 'r1', name: '반창고', price: 1500, emoji: '🩹', imageUrl: '/images/products/반창고.png', category: 'etc' },
  { id: 's2', name: '칫솔·치약 세트', price: 2000, emoji: '🪥', imageUrl: '/images/products/칫솔치약세트.png', category: 'etc' },
  { id: 'b1', name: '휴지', price: 2000, emoji: '🧻', imageUrl: '/images/products/휴지.png', category: 'etc' },
  { id: 'm1', name: '건전지', price: 1800, emoji: '🔋', imageUrl: '/images/products/건전지.png', category: 'etc' },
  { id: 's1', name: '감자칩', price: 2500, emoji: '🍪', imageUrl: '/images/products/감자칩.png', category: 'snack' },
];

const MY_CHOICE_ITEMS: Product[] = [
  { id: 'my1', name: '아이스크림', price: 5000, emoji: '🍦', imageUrl: '/images/products/아이스크림.png', category: 'personal' },
  { id: 'my2', name: '초코바', price: 2500, emoji: '🍫', imageUrl: '/images/products/초코바.png', category: 'personal' },
  { id: 'my3', name: '팝콘', price: 4500, emoji: '🍿', imageUrl: '/images/products/팝콘.png', category: 'personal' },
  { id: 'my4', name: '젤리', price: 2000, emoji: '🧸', imageUrl: '/images/products/젤리.png', category: 'personal' },
];

const SPECIAL_OFFER: Product = {
  id: 'special1',
  name: '1+1 젤리',
  price: 3000,
  emoji: '🎁',
  imageUrl: '/images/products/젤리.jpg',
  category: 'personal'
};

function ProductImage({ item, className = '' }: { item: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (item.imageUrl && !failed) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        className={`object-cover rounded-2xl ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }
  return <div className={`flex items-center justify-center text-5xl ${className}`}>{item.emoji}</div>;
}

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('INTRO');
  const [cart, setCart] = useState<Product[]>([]);
  const [myItems, setMyItems] = useState<Product[]>([]);
  const [resultType, setResultType] = useState<ResultType | null>(null);
  const [budgetWarning, setBudgetWarning] = useState(false);
  const [rejectedItemId, setRejectedItemId] = useState<string | null>(null);
  const [confirmCheckout, setConfirmCheckout] = useState(false);

  // --- Derived State ---
  const currentTotal = useMemo(() => {
    const cartSum = cart.reduce((sum, item) => sum + item.price, 0);
    const mySum = myItems.reduce((sum, item) => sum + item.price, 0);
    return cartSum + mySum;
  }, [cart, myItems]);

  const balance = INITIAL_BUDGET - currentTotal;

  const missionStatus = useMemo(() => {
    const drinks = cart.filter(item => item.category === 'drink').length;
    return {
      drink: drinks,
      isComplete: drinks >= MISSION_TARGETS.drink,
    };
  }, [cart]);

  // --- Handlers ---
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  // cart가 바뀌면 계산 확인 상태 초기화
  const prevCartLengthRef = useRef(cart.length);
  useEffect(() => {
    if (prevCartLengthRef.current !== cart.length) {
      setConfirmCheckout(false);
      prevCartLengthRef.current = cart.length;
    }
  }, [cart.length]);

  const triggerBudgetWarning = () => {
    setBudgetWarning(true);
    setTimeout(() => setBudgetWarning(false), 500);
  };

  const handleShelfClick = (product: Product) => {
    if (currentTotal + product.price > INITIAL_BUDGET) {
      triggerBudgetWarning();
      setRejectedItemId(product.id);
      setTimeout(() => setRejectedItemId(null), 700);
      return;
    }
    addToCart(product);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const addToMyItems = (product: Product) => {
    setMyItems([product]);
    if (currentTotal + product.price > INITIAL_BUDGET) {
      setScreen('BUDGET_OVER');
    } else {
      setResultType('PERFECT');
      setScreen('RESULT');
    }
  };

  const resetGame = () => {
    setScreen('INTRO');
    setCart([]);
    setMyItems([]);
    setResultType(null);
    setConfirmCheckout(false);
  };

  const removeItemForCorrection = (item: Product, isCart: boolean, index: number) => {
    if (isCart) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    } else {
      const newMyItems = [...myItems];
      newMyItems.splice(index, 1);
      setMyItems(newMyItems);
    }
  };

  const finishAfterCorrection = () => {
    const drinks = cart.filter(item => item.category === 'drink').length;

    if (drinks >= MISSION_TARGETS.drink) {
      setResultType(myItems.length > 0 ? 'PERFECT' : 'MISSION_COMPLETE');
    } else {
      setResultType('FAILED_MISSION');
    }
    setScreen('RESULT');
  };

  // --- Sub-components ---
  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex items-center gap-1 text-gray-400 font-bold text-lg px-2 py-2 self-start"
    >
      ← 뒤로
    </motion.button>
  );

  const BudgetBar = ({ step }: { step?: { num: string; label: string; icon: string } }) => {
    const loc = SCREEN_LOCATION[screen];
    return (
      <motion.div
        animate={budgetWarning ? { x: [-6, 6, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={`sticky top-0 z-50 backdrop-blur-md border-b-4 p-4 shadow-md transition-colors duration-200 ${
          budgetWarning ? 'bg-red-50/90 border-red-400' : 'bg-white/90 border-orange-400'
        }`}
      >
        <div className="max-w-[1024px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className={`w-8 h-8 ${budgetWarning ? 'text-red-500' : 'text-orange-500'}`} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-500">남은 돈</span>
              <span className={`text-2xl font-black ${balance < 0 || budgetWarning ? 'text-red-500' : 'text-orange-600'}`}>
                {balance.toLocaleString()}원
              </span>
              <AnimatePresence>
                {budgetWarning && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-black text-red-500"
                  >
                    돈이 부족해요! 💸
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-300 px-3 py-1.5 rounded-full">
            <span className="text-base">{loc.emoji}</span>
            <span className="font-black text-stone-600 text-sm">{loc.label}</span>
          </div>
          {step && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-gray-400">{step.num}</span>
              <div className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-200 px-3 py-1.5 rounded-full">
                <span className="text-lg">{step.icon}</span>
                <span className="font-black text-orange-700 text-sm">{step.label}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${SCREEN_LOCATION[screen].bg} font-sans text-gray-900 pb-20 select-none transition-colors duration-500`}>
      <AnimatePresence mode="wait">
        
        {/* --- SCREEN 1: INTRO --- */}
        {screen === 'INTRO' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 max-w-[1024px] mx-auto flex flex-col items-center justify-center min-h-screen text-center"
          >
            <div className="flex items-center gap-2 bg-white/80 border-2 border-amber-200 px-4 py-2 rounded-full mb-6">
              <span className="text-xl">🏫</span>
              <span className="font-black text-amber-700">교실</span>
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-white relative mb-8">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl">👨‍🏫</div>
              <div className="mt-4 space-y-4">
                <p className="text-2xl font-bold leading-relaxed">
                  "안녕! 선생님이랑 친구랑 같이 마실<br/>
                  <span className="text-orange-500">음료수 3개</span>만<br/>
                  사다줄 수 있을까?"
                </p>
                <div className="bg-yellow-100 p-4 rounded-2xl border-2 border-yellow-300">
                  <p className="text-lg font-bold text-yellow-800">예산: 10,000원</p>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setScreen('MISSION_SHOPPING')}
              className="group bg-orange-400 hover:bg-orange-500 text-white px-12 py-6 rounded-full text-3xl font-black shadow-lg shadow-orange-200 flex items-center gap-4"
            >
              출발! <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </motion.div>
        )}

        {/* --- SCREEN 2: MISSION SHOPPING --- */}
        {screen === 'MISSION_SHOPPING' && (
          <motion.div 
            key="shopping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <BudgetBar step={{ num: '1 / 2단계', label: '선생님 부탁', icon: '🛒' }} />

            <div className="p-4 max-w-[1024px] mx-auto w-full">
              <BackButton onClick={() => { setCart([]); setMyItems([]); setScreen('INTRO'); }} />
              <div className="flex flex-col md:flex-row gap-6 items-start">

                {/* 장바구니 + 버튼 (모바일: 상단 / 태블릿: 우측 고정) */}
                <div className="order-1 md:order-2 w-full md:w-[360px] md:sticky md:top-[88px]">
                  <div className="bg-white rounded-3xl p-6 shadow-sm mb-4 border-4 border-orange-100">
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                      <ShoppingCart className="text-orange-500" /> 장바구니
                      <span className="ml-auto text-orange-600 font-black">{currentTotal.toLocaleString()}원</span>
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const slots: JSX.Element[] = [];
                        const counts = {
                          drink: cart.filter(i => i.category === 'drink').length,
                        };
                        const defs: Array<{ category: 'drink'; source: Product; target: number }> = [
                          { category: 'drink', source: ITEMS[0], target: MISSION_TARGETS.drink },
                        ];
                        for (const { category, source, target } of defs) {
                          const displayCount = Math.max(target, counts[category]);
                          for (let slotIdx = 0; slotIdx < displayCount; slotIdx++) {
                            const filled = slotIdx < counts[category];
                            const isExtra = slotIdx >= target;
                            slots.push(
                              <div
                                key={`${category}-slot-${slotIdx}`}
                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${
                                  !filled
                                    ? 'bg-gray-50 border-dashed border-gray-200 opacity-40'
                                    : isExtra
                                    ? 'bg-orange-50 border-orange-300'
                                    : 'bg-orange-50 border-orange-200'
                                }`}
                              >
                                <ProductImage item={source} className="w-12 h-12 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="font-bold text-lg text-gray-800">{source.name}</div>
                                  {isExtra && <div className="text-xs text-orange-500 font-bold mb-0.5">부탁받은 건 {target}개예요</div>}
                                  <div className={`font-bold ${isExtra ? 'text-orange-600' : 'text-orange-500'}`}>{source.price.toLocaleString()}원</div>
                                </div>
                                {filled && (
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      for (let i = cart.length - 1; i >= 0; i--) {
                                        if (cart[i].category === category) { removeFromCart(i); break; }
                                      }
                                    }}
                                    className="bg-red-100 text-red-500 px-4 py-4 rounded-2xl font-black text-lg border-2 border-red-200 flex-shrink-0 min-h-[60px]"
                                  >
                                    빼기
                                  </motion.button>
                                )}
                              </div>
                            );
                          }
                        }
                        return slots;
                      })()}
                      {cart.map((item, idx) => {
                        if (item.category === 'drink') return null;
                        return (
                          <div key={`etc-${idx}`} className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50 border-2 border-orange-200">
                            <ProductImage item={item} className="w-12 h-12 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-800">{item.name}</div>
                              <div className="text-xs text-orange-500 font-bold mb-0.5">부탁받은 건 아니에요</div>
                              <div className="text-orange-600 font-bold">{item.price.toLocaleString()}원</div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(idx)}
                              className="bg-red-100 text-red-500 px-4 py-4 rounded-2xl font-black text-lg border-2 border-red-200 flex-shrink-0 min-h-[60px]"
                            >
                              빼기
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    disabled={cart.length === 0}
                    onClick={() => {
                      if (missionStatus.isComplete) {
                        setScreen('BALANCE_CHECK');
                      } else if (!confirmCheckout) {
                        setConfirmCheckout(true);
                      } else {
                        setConfirmCheckout(false);
                        setResultType('FAILED_MISSION');
                        setScreen('RESULT');
                      }
                    }}
                    className={`w-full py-6 rounded-3xl text-2xl font-black flex items-center justify-center gap-3 transition-all duration-200 ${
                      cart.length === 0
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : confirmCheckout
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : 'bg-orange-400 text-white shadow-lg shadow-orange-200'
                    }`}
                  >
                    {confirmCheckout ? '정말 다 골랐나요? 한 번 더 눌러요 👆' : '다 골랐어요. 계산할래요'} <ArrowRight />
                  </motion.button>
                </div>

                {/* 선반 (모바일: 하단 / 태블릿: 좌측) */}
                <div className="order-2 md:order-1 flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ITEMS.map((item) => {
                      const canAfford = currentTotal + item.price <= INITIAL_BUDGET;
                      const isRejected = rejectedItemId === item.id;
                      return (
                        <div key={item.id} className="relative">
                          <motion.button
                            whileTap={canAfford ? { scale: 0.95 } : {}}
                            onClick={() => handleShelfClick(item)}
                            className={`w-full bg-white p-5 rounded-[2rem] shadow-md border-4 text-left transition-all duration-300 ${
                              canAfford
                                ? 'hover:shadow-xl border-transparent active:border-orange-300'
                                : 'opacity-40 border-transparent cursor-not-allowed'
                            }`}
                          >
                            <ProductImage item={item} className="w-full aspect-square mb-2" />
                            <div className="font-black text-xl mb-1">{item.name}</div>
                            <div className="text-orange-500 font-bold">{item.price.toLocaleString()}원</div>
                            {!canAfford && (
                              <div className="text-xs font-black text-red-400 mt-1">잔액 부족</div>
                            )}
                          </motion.button>

                          <AnimatePresence>
                            {isRejected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{ duration: 0.15 }}
                                className="absolute inset-0 rounded-[2rem] bg-white/90 flex items-center justify-center pointer-events-none"
                              >
                                <span className="text-gray-800 font-black text-2xl text-center leading-snug">
                                  돈이<br/>부족해요! 💸
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 2.5: BALANCE CHECK --- */}
        {screen === 'BALANCE_CHECK' && (
          <motion.div
            key="balance-check"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col min-h-screen"
          >
            <BudgetBar />
            <div className="p-6 max-w-[600px] mx-auto w-full flex flex-col items-center justify-center min-h-[80vh] gap-8">
              <BackButton onClick={() => setScreen('MISSION_SHOPPING')} />

              <div className="bg-white rounded-[3rem] p-10 shadow-xl w-full text-center">
                <p className="text-3xl font-black mb-3">미션 완료! 🎉</p>
                <p className="text-2xl font-bold text-gray-600 leading-relaxed">
                  선생님이 남는 돈{' '}
                  <span className="text-orange-500 font-black">{balance.toLocaleString()}원</span>으로<br/>
                  하나 더 사도 된대요.
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setScreen('MY_CHOICE')}
                  className="w-full bg-orange-400 text-white py-6 rounded-3xl text-3xl font-black shadow-lg shadow-orange-200"
                >
                  살래요! 🎁
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setResultType('MISSION_COMPLETE'); setScreen('RESULT'); }}
                  className="w-full bg-white text-gray-400 border-2 border-gray-200 py-5 rounded-3xl text-2xl font-black"
                >
                  안 살래요
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 3: MY CHOICE --- */}
        {screen === 'MY_CHOICE' && (
          <motion.div
            key="my-choice"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <BudgetBar step={{ num: '2 / 2단계', label: '내 것 고르기', icon: '🎁' }} />
            <div className="p-6 max-w-[1024px] mx-auto w-full">
              <BackButton onClick={() => { setMyItems([]); setScreen('MISSION_SHOPPING'); }} />
              <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* 장바구니 요약 + 잔액 (모바일: 상단 / 태블릿: 우측 고정) */}
                <div className="order-1 md:order-2 md:w-[280px] md:sticky md:top-[88px] md:flex-shrink-0 space-y-4">
                  <div className="bg-white rounded-3xl p-5 shadow-sm border-4 border-green-100">
                    <h3 className="text-base font-black text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> 미션 완료!
                    </h3>
                    <div className="space-y-2">
                      {cart.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-green-50">
                          <ProductImage item={item} className="w-8 h-8 flex-shrink-0" />
                          <span className="font-bold text-sm flex-1">{item.name}</span>
                          <span className="text-sm font-bold text-green-700">{item.price.toLocaleString()}원</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border-4 border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-bold text-gray-500">남은 돈</span>
                    </div>
                    <div className="text-3xl font-black text-orange-600">{balance.toLocaleString()}원</div>
                    <p className="text-base font-black text-orange-500 mt-2">뭐 먹고싶어요? 🍬</p>
                  </div>
                </div>

                {/* 제품 그리드 (모바일: 하단 / 태블릿: 좌측) */}
                <div className="order-2 md:order-1 flex-1">
                  {myItems.length === 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setResultType('MISSION_COMPLETE'); setScreen('RESULT'); }}
                      className="w-full mb-4 py-4 rounded-3xl text-xl font-black text-gray-400 bg-white border-2 border-gray-200 flex items-center justify-center gap-2"
                    >
                      안 살래요 →
                    </motion.button>
                  )}

                  {/* 일반 아이템 2×2 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {MY_CHOICE_ITEMS.map((item) => {
                      const isSelected = myItems.some(m => m.id === item.id);
                      const hasSelection = myItems.length > 0;
                      return (
                        <motion.button
                          key={item.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { if (!hasSelection) addToMyItems(item); }}
                          className={`bg-white p-5 rounded-[2rem] shadow-lg border-4 text-center flex flex-col items-center transition-all duration-300 ${
                            isSelected
                              ? 'border-orange-400 ring-4 ring-orange-200 scale-105'
                              : hasSelection
                              ? 'opacity-30 border-transparent'
                              : 'border-transparent hover:border-orange-400'
                          }`}
                        >
                          <ProductImage item={item} className="w-full aspect-square mb-3" />
                          <div className="font-black text-xl mb-1">{item.name}</div>
                          <div className="text-orange-500 font-black text-lg">{item.price.toLocaleString()}원</div>
                        </motion.button>
                      );
                    })}
                  </div>

                </div>

              </div>
            </div>
          </motion.div>
        )}


        {/* --- SCREEN 5: BUDGET OVER --- */}
        {screen === 'BUDGET_OVER' && (
          <motion.div 
            key="over"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
             <div className="sticky top-0 bg-orange-500 text-white p-6 shadow-xl text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2 opacity-80">
                <span className="text-sm font-black">💳 계산대</span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <AlertCircle className="w-10 h-10" />
                <h2 className="text-3xl font-black">앗! 돈이 부족해요</h2>
              </div>
              <p className="text-xl font-bold">{(-balance).toLocaleString()}원이 더 필요합니다.</p>
            </div>

            <div className="p-6 max-w-[1024px] mx-auto w-full">
              <BackButton onClick={() => { setMyItems([]); setScreen('MY_CHOICE'); }} />
              <div className="bg-white rounded-3xl p-6 shadow-md mb-6 border-4 border-red-50" >
                <p className="text-lg font-bold text-gray-500 mb-4 text-center">장바구니에서 하나를 빼야 해요.</p>
                
                <div className="space-y-4">
                  {/* My Choice Items */}
                  {myItems.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-black text-orange-600 flex items-center gap-2 px-2">
                        <User className="w-5 h-5"/> 내가 고른 것
                      </p>
                      {myItems.map((item, idx) => (
                        <motion.button
                          key={`my-over-${idx}`}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => removeItemForCorrection(item, false, idx)}
                          className="w-full flex items-center justify-between p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl group hover:border-red-400 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <ProductImage item={item} className="w-12 h-12" />
                            <span className="text-xl font-bold">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-orange-700">{item.price.toLocaleString()}원</span>
                            <span className="text-lg font-black text-red-500 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl min-h-[44px] flex items-center">빼기</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Mission Items */}
                  <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200">
                    <p className="font-black text-orange-600 flex items-center gap-2 px-2">
                      <ShoppingBag className="w-5 h-5"/> 선생님의 부탁
                    </p>
                    {cart.map((item, idx) => (
                      <motion.button
                        key={`cart-over-${idx}`}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => removeItemForCorrection(item, true, idx)}
                        className="w-full flex items-center justify-between p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:border-red-400 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <ProductImage item={item} className="w-12 h-12" />
                          <span className="text-xl font-bold">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-orange-700">{item.price.toLocaleString()}원</span>
                          <span className="text-lg font-black text-red-500 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl min-h-[44px] flex items-center">빼기</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {balance >= 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={finishAfterCorrection}
                  className="w-full bg-orange-500 text-white py-6 rounded-3xl text-2xl font-black shadow-xl shadow-orange-200 flex items-center justify-center gap-3"
                >
                  이제 계산할 수 있어요! <ArrowRight />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 6: RESULT --- */}
        {screen === 'RESULT' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-[1024px] mx-auto min-h-screen flex flex-col items-center text-center gap-6 pb-20"
          >
            {/* Header */}
            <div className="space-y-3 pt-4">
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-white/80 border-2 border-amber-200 px-4 py-2 rounded-full">
                  <span className="text-xl">🏫</span>
                  <span className="font-black text-amber-700">교실</span>
                </div>
              </div>
              <div className="text-8xl">
                {resultType === 'PERFECT' ? '🎉' : resultType === 'FAILED_MISSION' ? '😢' : '👍'}
              </div>
              <h1 className={`text-5xl font-black ${
                resultType === 'PERFECT' ? 'text-orange-500' :
                resultType === 'FAILED_MISSION' ? 'text-red-500' :
                'text-green-600'
              }`}>
                {resultType === 'PERFECT' ? '미션 완료!' :
                 resultType === 'FAILED_MISSION' ? '조금 아쉬워요' :
                 '성공!'}
              </h1>
            </div>

            {/* Sections: 태블릿에서 나란히 */}
            <div className="w-full flex flex-col md:flex-row gap-6 items-start">
            {/* Section 1: 내가 산 것 */}
            <div className="flex-1 bg-white rounded-3xl p-6 shadow-md border-4 border-gray-100 text-left">
              <h3 className="text-xl font-black mb-4 text-gray-700">📋 내가 산 것</h3>

              <div className="space-y-3 mb-4">
                <p className="text-sm font-bold text-orange-500">선생님 부탁</p>
                {([
                  { category: 'drink', item: ITEMS[0], name: '음료수', target: MISSION_TARGETS.drink },
                ] as const).map(({ category, item: missionItem, name, target }) => {
                  const count = cart.filter(i => i.category === category).length;
                  const ok = count >= target;
                  return (
                    <div key={category} className={`flex items-center gap-3 p-3 rounded-2xl ${ok ? 'bg-green-50' : 'bg-red-50'}`}>
                      <ProductImage item={missionItem} className="w-10 h-10 flex-shrink-0" />
                      <span className="font-bold text-lg flex-1">{name}</span>
                      <span className={`font-black text-xl ${ok ? 'text-green-600' : 'text-red-500'}`}>
                        {count}/{target} {ok ? '✅' : '❌'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t-2 border-dashed border-gray-200">
                <p className="text-sm font-bold text-orange-500 mb-3">내가 고른 것</p>
                {myItems.length > 0 ? (
                  <div className="space-y-2">
                    {myItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50">
                        <ProductImage item={item} className="w-10 h-10 flex-shrink-0" />
                        <span className="font-bold text-lg flex-1">{item.name}</span>
                        <span className="font-black text-xl text-green-600">✅</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 font-bold text-lg">없음</p>
                )}
              </div>
            </div>

            {/* Section 2: 오늘은 어떻게 됐을까? */}
            <div className="flex-1 bg-white rounded-3xl p-6 shadow-md border-4 border-gray-100">
              <h3 className="text-xl font-black mb-4 text-gray-700">👥 오늘은 어떻게 됐을까?</h3>
              <div className="grid grid-cols-3 gap-3">
                {/* 선생님 */}
                <div className={`flex flex-col items-center p-4 rounded-2xl border-2 ${resultType !== 'FAILED_MISSION' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <span className="text-4xl mb-1">👨‍🏫</span>
                  <span className="font-bold text-sm mb-2">선생님</span>
                  {resultType !== 'FAILED_MISSION'
                    ? <ProductImage item={ITEMS[0]} className="w-12 h-12" />
                    : <span className="text-2xl">—</span>}
                  <span className={`text-xs font-black mt-1 ${resultType !== 'FAILED_MISSION' ? 'text-green-600' : 'text-red-500'}`}>
                    {resultType !== 'FAILED_MISSION' ? '맛있게 드심' : '없어요 😥'}
                  </span>
                </div>

                {/* 친구 */}
                <div className={`flex flex-col items-center p-4 rounded-2xl border-2 ${resultType !== 'FAILED_MISSION' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <span className="text-4xl mb-1">🧑</span>
                  <span className="font-bold text-sm mb-2">친구</span>
                  {resultType !== 'FAILED_MISSION'
                    ? <ProductImage item={ITEMS[0]} className="w-12 h-12" />
                    : <span className="text-2xl">—</span>}
                  <span className={`text-xs font-black mt-1 ${resultType !== 'FAILED_MISSION' ? 'text-green-600' : 'text-red-500'}`}>
                    {resultType !== 'FAILED_MISSION' ? '맛있게 먹음' : '없어요 😥'}
                  </span>
                </div>

                {/* 나 */}
                {(() => {
                  const personalItem = myItems.find(i => i.category === 'personal');
                  const hasDrink = resultType !== 'FAILED_MISSION';
                  return (
                    <div className={`flex flex-col items-center p-4 rounded-2xl border-2 ${
                      personalItem ? 'bg-orange-50 border-orange-200' :
                      hasDrink ? 'bg-green-50 border-green-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <span className="text-4xl mb-1">😊</span>
                      <span className="font-bold text-sm mb-2">나</span>
                      <div className="flex gap-1 items-center">
                        {hasDrink && <ProductImage item={ITEMS[0]} className="w-8 h-8" />}
                        {personalItem && <ProductImage item={personalItem} className="w-8 h-8" />}
                        {!hasDrink && <span className="text-2xl">—</span>}
                      </div>
                      <span className={`text-xs font-black mt-1 text-center ${
                        personalItem ? 'text-orange-600' :
                        hasDrink ? 'text-green-600' :
                        'text-red-500'
                      }`}>
                        {!hasDrink ? '없어요 😥' : personalItem ? '같이 맛있게 먹었어요' : '맛있게 먹음'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            </div> {/* end two-column wrapper */}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={resetGame}
              className="bg-gray-900 text-white px-12 py-6 rounded-full text-2xl font-black flex items-center gap-4 group"
            >
              <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" /> 다시 해볼래요
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
