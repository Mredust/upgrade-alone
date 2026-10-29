export interface TrainingGroup {
  key: string;
  label: string;
  actions: string[];
}

export const TRAINING_GROUPS: TrainingGroup[] = [
  {
    key: "chest",
    label: "胸",
    actions: ["平板哑铃卧推", "上斜哑铃卧推", "平板哑铃飞鸟", "俯卧撑", "杠铃推胸", "飞鸟夹胸"],
  },
  {
    key: "back",
    label: "背",
    actions: [
      "助力引体向上",
      "单臂哑铃划船",
      "宽距正握高位下拉",
      "坐姿绳索划船",
      "龙门架直臂下压",
      "哑铃划船",
      "杠铃划船",
      "引体向上",
    ],
  },
  {
    key: "shoulder",
    label: "肩",
    actions: ["坐姿哑铃推肩", "哑铃侧平举", "俯身哑铃飞鸟", "哑铃推肩", "杠铃推肩", "哑铃前平举"],
  },
  {
    key: "legs",
    label: "腿",
    actions: ["史密斯杠铃深蹲", "硬拉", "器械腿举", "杠铃深蹲", "腿屈伸", "腿弯举"],
  },
  {
    key: "triceps",
    label: "三头",
    actions: ["双杠臂屈伸", "绳索臂屈伸", "哑铃颈后臂屈伸"],
  },
  {
    key: "biceps",
    label: "二头",
    actions: ["站姿杠铃弯举"],
  },
  {
    key: "abs",
    label: "腹",
    actions: ["平板支撑", "卷腹", "V字卷腹", "俄罗斯转体", "杠铃片卷腹", "抬腿", "药球俄罗斯转体"],
  },
  {
    key: "cardio",
    label: "有氧",
    actions: ["跑步", "跳绳"],
  },
  {
    key: "rest",
    label: "休息",
    actions: [],
  },
];

export const CARDIO_UNITS: Record<string, string> = {
  跑步: "km",
  跳绳: "分钟",
};

export const TRAINING_GROUP_LABELS: Record<string, string> = Object.fromEntries(
  TRAINING_GROUPS.map((g) => [g.key, g.label])
);