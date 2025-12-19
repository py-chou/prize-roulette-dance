import { Participant } from '@/types/participant';

const firstNames = [
  '小明', '小華', '志偉', '淑芬', '俊傑', '美玲', '建宏', '雅婷', '家豪', '怡君',
  '宗翰', '佳琪', '冠宇', '雅雯', '承翰', '詩涵', '柏翰', '宜蓁', '宇軒', '思穎',
  '彥廷', '珮琪', '冠廷', '婷婷', '育誠', '雅萍', '柏毅', '欣怡', '建志', '佳蓉',
  '家維', '嘉琪', '宗霖', '雅慧', '承恩', '詩婷', '柏勳', '宜婷', '宇翔', '思妤',
  '彥宏', '珮君', '冠霖', '婷雅', '育豪', '雅琳', '柏軒', '欣蓉', '建成', '佳怡'
];

const lastNames = [
  '王', '李', '張', '劉', '陳', '楊', '黃', '趙', '周', '吳',
  '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '林', '羅',
  '鄭', '梁', '謝', '宋', '唐', '許', '韓', '馮', '鄧', '曹'
];

const avatarColors = [
  '7c3aed', 'db2777', '059669', '0891b2', 'ca8a04', 'd97706', 'dc2626', '4f46e5',
  '7c2d12', '166534', '1e40af', '7e22ce', 'be123c', '0369a1', '4338ca', '9333ea'
];

export const generateParticipants = (count: number): Participant[] => {
  const participants: Participant[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${lastName}${firstName}`;
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    
    participants.push({
      id: i + 1,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128&font-size=0.4&bold=true`,
    });
  }
  
  return participants;
};

export const selectRandomWinners = (participants: Participant[], winnerCount: number): Participant[] => {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(winnerCount, participants.length));
};