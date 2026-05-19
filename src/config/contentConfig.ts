export const contentConfig = {
  intro: {
    posterInfo: {
      subText1: "晓雾将歇",
      subText2: "百鸟齐鸣",
      logoText: "新世界",
      warning: "此去凶险，切记隐蔽身份。"
    },
    buttonText: "揭开序幕"
  },
  hero: {
    title: "破笼之宴",
    subtitle: "新世界庄园 1.0 完结纪念",
    date: "1945 · 上海",
    description: "一场蓄谋已久的晚宴，一次撕裂黑暗的破笼。在这座一万平米的庄园里，每一个角落都藏着时代的叹息与抗争。1.0版本虽已落幕，但黎明前的回声永不消散。"
  },
  story: {
    sectionTitle: "旧影重现",
    paragraphs: [
      "1945年，上海滩风云诡谲。马勒庄园内，一场名为“破笼”的宴会悄然开幕。",
      "四栋别墅、两座戏院、一个码头，构成了这个庞大而错综复杂的悬疑迷宫。在六个小时的沉浸式体验中，观众与剧中人同呼吸、共命运。",
      "每一次推开一扇门，都是在翻开一段尘封的历史。那些被隐藏的真相、被压抑的情感，在昏暗的灯光与交错的脚步声中，渐渐浮出水面。"
    ]
  },
  map: {
    sectionTitle: "万平迷局",
    description: "占地一万平方米的马勒庄园版图，分为四大核心区域。点击查看各势力的地形情报。",
    locations: [
      {
        id: "qingbang",
        name: "青帮",
        desc: "鱼龙混杂的江湖地盘。内设歌舞厅、赌坊、黑市、当铺与地下擂台，三教九流汇聚于此，暗藏无数黑道秘密与交易。",
        x: 20, // Percentage coordinates for positioning on the map
        y: 25,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Vintage+1945+Shanghai+Dance+Hall+Casino+Gangster+Cinematic&image_size=landscape_4_3",
        subLocations: [
          // 仅在 3D 建筑上展示的精简点位
          // showOnBuilding: true 表示会作为小标注悬浮在 3D 楼体上
          // fx, fy 控制其在建筑正面的 X, Y 轴相对位置，范围通常是 -0.5 到 0.5
          { name: "青龙堂", fx: -0.2, fy: 0.5, showOnBuilding: true },
          { name: "玄武堂", fx: 0.2, fy: 0.5, showOnBuilding: true },
          // 仅在点击弹出的详情面板中展示的其他点位
          { name: "歌舞厅" },
          { name: "赌场" },
          { name: "鞋店" },
          { name: "茶室" },
          { name: "黑市" },
          { name: "箱包店" },
          { name: "香烟店" },
          { name: "裁缝店" },
          { name: "字画馆" },
          { name: "风水店" },
          { name: "铁匠铺" },
          { name: "古董店" },
          { name: "书局" },
          { name: "大讲堂" },
          { name: "杂货铺" },
          { name: "花店" },
          { name: "当铺" },
          { name: "中药铺" }
        ]
      },
      {
        id: "shanghui",
        name: "商会",
        desc: "金钱与权力的交织网。汇集了银行、交易所、珠宝店与洋行。表面光鲜亮丽，背地里却操控着上海滩的经济命脉。",
        x: 45,
        y: 28,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Vintage+1945+Shanghai+Chamber+Of+Commerce+Bank+Interior+Cinematic&image_size=landscape_4_3",
        subLocations: [
          // 仅在 3D 建筑上展示的精简点位
          { name: "天宝商会", fx: -0.3, fy: 0.3, showOnBuilding: true },
          { name: "仁广商会", fx: -0.3, fy: 0.75, showOnBuilding: true },
          { name: "合众商会", fx: 0.3, fy: 0.75, showOnBuilding: true },
          // 仅在详情面板中展示的其他点位
          { name: "投资部" },
          { name: "交易所" },
          { name: "银行" },
          { name: "旗袍店" },
          { name: "眼镜店" },
          { name: "照相馆" },
          { name: "珠宝店" }
        ]
      },
      {
        id: "hospital",
        name: "军医院",
        desc: "看似救死扶伤的圣地，但在战火纷飞的年代，这里或许隐藏着不可告人的生化机密、秘密伤员与重要情报。",
        x: 68,
        y: 25,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Vintage+1945+Military+Hospital+Ward+Shanghai+Cinematic+Lighting&image_size=landscape_4_3",
        subLocations: [
          // 军医院不展示任何 3D 建筑点位
          { name: "无" }
        ]
      },
      {
        id: "intelligence",
        name: "情报局",
        desc: "戒备森严的特工大本营。设有审讯科、档案处与三大行动处。这里的每一份绝密电报，都足以决定生死。",
        x: 88,
        y: 30,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Vintage+1945+Shanghai+Intelligence+Agency+Office+Files+Cinematic&image_size=landscape_4_3",
        subLocations: [
          // 仅在 3D 建筑上展示的精简点位
          { name: "第一行动处", fx: -0.1, fy: 0.85, showOnBuilding: true },
          { name: "第二行动处", fx: 0.5, fy: 0.15, showOnBuilding: true },
          { name: "第三行动处", fx: 0, fy: 0.15, showOnBuilding: true },
          { name: "警局", fx: 0.3, fy: 0.15, showOnBuilding: true },
          { name: "档案处", fx: -0.35, fy: 0.15, showOnBuilding: true },
          // 仅在详情面板中展示的其他点位
          { name: "审讯科" },
          { name: "检验科" },
          { name: "工作间" },
          { name: "后勤部" }
        ]
      }
    ]
  },
  timeline: {
    sectionTitle: "六小时的生死",
    events: [
      {
        time: "16:00",
        title: "入局",
        desc: "踏入马勒庄园，换上旧日衣裳，蛰伏于暗处等待时机。"
      },
      {
        time: "18:30",
        title: "晚宴",
        desc: "破笼晚宴正式开启。觥筹交错间，各怀鬼胎，杀机暗藏。"
      },
      {
        time: "21:00",
        title: "惊变",
        desc: "戏院突发变故，枪声打破宁静，阵营暗战彻底浮出水面。"
      },
      {
        time: "22:00",
        title: "撤离",
        desc: "乘着时光列车逃离1945。车窗外，NPC在夜色中奔跑挥手，眼泪模糊了视线。"
      }
    ]
  },
  gallery: {
    sectionTitle: "庄园记忆",
    description: "光影斑驳间，定格了无数次惊心动魄的瞬间。这里不仅是舞台，更是那个时代的缩影。"
  },
  exhibition: {
    sectionTitle: "玩家记忆",
    description: "每一张照片背后，都藏着一段玩家独特的记忆。上传你的专属记忆，与我们在新世界重逢。"
  },
  miniGame: {
    sectionTitle: "档案解密行动",
    description: "上海滩暗流涌动，同伴的身份已被加密。请通过记忆配对找出相同的档案，唤醒潜伏者，获取他们的绝密口信。",
    cards: [
      { id: 1, character: "白玉兰", quote: "“进了我白虎堂，就是我白玉兰的人。”" },
      { id: 2, character: "杜月明", quote: "“团结一条心，石头变成金。”" },
      { id: 3, character: "顾佳棠", quote: "“战争就像一场噩梦，有些人注定要困死在里面，而有些人会醒来。”" },
      { id: 4, character: "侯方知", quote: "“真相只会害人，没有任何意义。”" },
      { id: 5, character: "乔朗", quote: "“你是我唯一的女主角。”" },
      { id: 6, character: "唐雁翎", quote: "“能击穿恐惧。”" },
      { id: 7, character: "张大暑", quote: "“把钱全都攒起来！”" },
      { id: 8, character: "詹明城", quote: "“你是我最后的底牌。”" },
      { id: 9, character: "詹天放", quote: "“宇宙第一警察署队长詹天放，前来报到！”" },
      { id: 10, character: "周柯琳", quote: "“顺势而为，本心不亏。”" }
    ],
    gameUI: {
      moves: "破译步数",
      matches: "已联络",
      waiting: "等待接收密电信号...",
      victoryTitle: "晓雾将歇，百鸟齐鸣",
      victoryMessage: "所有潜伏者已成功联络。长夜将尽，准备迎接黎明！",
      restart: "重新破译"
    }
  },
  finale: {
    title: "长夜将明",
    message: "感谢每一位走进《新世界庄园》的旅人。1.0版本的“破笼之宴”已圆满落幕。我们曾在黑暗中并肩，也必将在光明中重逢。",
    epilogue:
      "如果说“破笼之宴”是一场发生在1945年的梦，那么真正让它完整的，是每一个认真入局、用力共鸣的人。你们的脚步、目光、迟疑与泪水，都是这座庄园留下的回声。",
    signature: "故事暂时落幕，记忆不会散场。等下一次灯光亮起，我们在新世界再见。"
  }
};
