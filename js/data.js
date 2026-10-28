// ============ DATA ============
// entity：group 为集团/投资组合归属；parent 为已核实的公司母体（可能经中间公司持有）。
// listed 只列本条目对应公司自身的上市证券，不借用母公司代码；jv 不代表品牌。
// null / [] 表示未确认或不适用，并非保证不存在；核实口径与出处见 HANDOFF.md。
const SITE_DATA = {
  brands: [
    {
      id: 'byd', name: 'BYD', cn: '比亚迪', founded: 1995, hq: 'Shenzhen', focus: 'EV / Hybrid',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [
          {
            "exchange": "SZSE",
            "code": "002594"
          },
          {
            "exchange": "HKEX",
            "code": "01211"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'group',
      colorA: '#d4302a', colorB: '#1a1a1a',
      desc_en: 'A mainstream Chinese auto group transformed by new energy. It combines complete vehicle manufacturing, batteries, electric drives, power semiconductors and global export channels.',
      desc_zh: '中国主流传统整车集团中新能源转型最成功的代表。具备整车制造、电池、电驱、功率半导体与全球出口渠道的垂直整合能力。',
      subBrands_en: 'BYD, Denza, Fang Cheng Bao, Yangwang',
      subBrands_zh: '比亚迪、腾势、方程豹、仰望',
      image: 'images/byd-brand.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },
    {
      id: 'nio', name: 'NIO', cn: '蔚来', founded: 2014, hq: 'Shanghai', focus: 'Premium EV',
      entity: {
        "group_en": "NIO Inc.",
        "group_zh": "蔚来集团",
        "listed": [
          {
            "exchange": "NYSE",
            "code": "NIO"
          },
          {
            "exchange": "HKEX",
            "code": "09866"
          },
          {
            "exchange": "SGX",
            "code": "NIO"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'startup',
      colorA: '#1d4ed8', colorB: '#0a0a0a',
      desc_en: 'Premium EV with battery-swap network. Europe push via Norway, Germany, Netherlands. Sub-brands Onvo and Firefly target lower segments.',
      desc_zh: '高端电动车，以换电网络著称。已在挪威、德国、荷兰开拓欧洲市场。乐道与萤火虫品牌覆盖中端。',
      image: 'images/nio-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },
    {
      id: 'xpeng', name: 'Xpeng', cn: '小鹏', founded: 2014, hq: 'Guangzhou', focus: 'Smart EV / ADAS',
      entity: {
        "group_en": "XPeng Inc.",
        "group_zh": "小鹏汽车",
        "listed": [
          {
            "exchange": "NYSE",
            "code": "XPEV"
          },
          {
            "exchange": "HKEX",
            "code": "09868"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'startup',
      colorA: '#22c55e', colorB: '#1a1a1a',
      desc_en: 'Tech-first EV brand with the most advanced city-level autonomous driving in China. Mona and P7+ pushed scale in 2025.',
      desc_zh: '科技优先的电动车品牌，城市智驾领先国内。MONA 与 P7+ 在 2025 年实现规模化。',
      image: 'images/xpeng-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'li', name: 'Li Auto', cn: '理想', founded: 2015, hq: 'Beijing', focus: 'Family EREV / EV',
      entity: {
        "group_en": "Li Auto Inc.",
        "group_zh": "理想汽车",
        "listed": [
          {
            "exchange": "NASDAQ",
            "code": "LI"
          },
          {
            "exchange": "HKEX",
            "code": "02015"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'startup',
      colorA: '#f59e0b', colorB: '#1a1a1a',
      desc_en: 'Family SUV specialist. EREV pioneer with the L-series; MEGA and i-series push pure EV. China\'s most profitable new-energy startup.',
      desc_zh: '家庭 SUV 专家。L 系列开创增程时代，MEGA 与 i 系列拓展纯电。中国最赚钱的新势力车企。',
      image: 'images/liauto-brand.jpg', imageCredit: 'Matti Blume / CC BY-SA'
    },
    {
      id: 'leapmotor', name: 'Leapmotor', cn: '零跑', founded: 2015, hq: 'Hangzhou', focus: 'Value Smart EV',
      entity: {
        "group_en": "Zhejiang Leapmotor Technology Co., Ltd.",
        "group_zh": "浙江零跑科技股份有限公司",
        "listed": [
          {
            "exchange": "HKEX",
            "code": "09863"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Leapmotor International B.V.",
            "name_zh": "零跑国际",
            "partners": [
              "Stellantis",
              "Leapmotor / 零跑汽车"
            ],
            "stake_note": "Stellantis 51%; Leapmotor 49%. These stakes are in the international JV, not Leapmotor itself. / Stellantis 51%、零跑汽车 49%，比例指零跑国际合资公司，不是零跑汽车本体。"
          }
        ]
      },
      category: 'startup',
      colorA: '#0ea5e9', colorB: '#0a0a0a',
      desc_en: 'Vertically-integrated value EV maker. Stellantis acquired approximately 20% of Leapmotor in 2023. Their separate international joint venture, Leapmotor International, is owned 51% by Stellantis and 49% by Leapmotor.',
      desc_zh: '垂直整合的高性价比新势力。Stellantis 于 2023 年入股零跑汽车约 20%；另设的出海合资公司零跑国际由 Stellantis 持股 51%、零跑汽车持股 49%。',
      image: 'images/leapmotor-c10.webp', imageCredit: 'Stellantis'
    },
    {
      id: 'zeekr', name: 'Zeekr', cn: '极氪', founded: 2021, hq: 'Hangzhou', focus: 'Performance EV',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": "Geely Automobile Holdings Limited",
        "parent_zh": "吉利汽车控股有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#0ea5e9', colorB: '#0a0a0a',
      desc_en: 'Geely Auto\'s premium EV arm, with the 001 shooting brake, 7X SUV and 009 luxury van. Listed on NYSE in 2024; taken private in December 2025 and now wholly owned by Geely Automobile Holdings.',
      desc_zh: '吉利汽车旗下高端电动品牌，拥有 001 猎装、7X SUV 与 009 豪华 MPV。2024 年于纽交所上市，2025 年 12 月完成私有化，现为吉利汽车控股全资子公司。',
      image: 'images/zeekr-brand.jpg', imageCredit: 'Zoerides / CC BY-SA 4.0'
    },
    {
      id: 'geely', name: 'Geely', cn: '吉利', founded: 1986, hq: 'Hangzhou', focus: 'Multi-brand group',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'group',
      colorA: '#3b82f6', colorB: '#1a1a1a',
      desc_en: 'Zhejiang Geely Holding is a private automotive holding group with investments across Geely Auto, Galaxy, Lynk & Co, Zeekr, Volvo Cars, Polestar and Lotus. It is distinct from Hong Kong-listed Geely Automobile Holdings (0175).',
      desc_zh: '浙江吉利控股是民营汽车控股集团，投资组合覆盖吉利汽车、银河、领克、极氪、沃尔沃汽车、极星与路特斯；它与香港上市公司吉利汽车控股（0175）是不同实体。',
      subBrands_en: 'Geely, Galaxy, Lynk & Co, Zeekr, Volvo, Polestar, Lotus',
      subBrands_zh: '吉利、银河、领克、极氪、沃尔沃、Polestar、路特斯',
      image: 'images/geely-brand.jpg', imageCredit: 'Nissangeniss / CC BY-SA 4.0'
    },
    {
      id: 'chery', name: 'Chery', cn: '奇瑞', founded: 1997, hq: 'Wuhu', focus: 'Mass-market export',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [
          {
            "exchange": "HKEX",
            "code": "09973"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Chery Jaguar Land Rover Automotive Co., Ltd.",
            "name_zh": "奇瑞捷豹路虎汽车有限公司",
            "partners": [
              "Chery Automobile / 奇瑞汽车",
              "Jaguar Land Rover / 捷豹路虎"
            ],
            "stake_note": "Chery Automobile 50%; JLR 50%. / 奇瑞汽车 50%、捷豹路虎 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#ef4444', colorB: '#1a1a1a',
      desc_en: 'Chery Automobile is an export-led automaker founded in Wuhu in 1997 and listed in Hong Kong (9973) in 2025. Its portfolio includes Chery, Exeed, Jetour, Omoda, Jaecoo and iCar. Chery Holding ceased to hold its shares directly after the January 2025 restructuring.',
      desc_zh: '奇瑞汽车于 1997 年在芜湖成立，2025 年于香港上市（9973），以出口见长，品牌体系涵盖奇瑞、星途、捷途、Omoda、Jaecoo 与 iCar。2025 年 1 月重组后，奇瑞控股已不再直接持有奇瑞汽车股份。',
      subBrands_en: 'Chery, Exeed, Jetour, Omoda, Jaecoo, iCar',
      subBrands_zh: '奇瑞、星途、捷途、Omoda、Jaecoo、iCar',
      image: 'images/chery-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },
    {
      id: 'changan', name: 'Changan', cn: '长安', founded: 1862, hq: 'Chongqing', focus: 'State automaker / NEV',
      entity: {
        "group_en": "China Changan Automobile Group Co., Ltd.",
        "group_zh": "中国长安汽车集团有限公司",
        "listed": [
          {
            "exchange": "SZSE",
            "code": "000625"
          },
          {
            "exchange": "SZSE",
            "code": "200625"
          }
        ],
        "parent_en": "China Changan Automobile Group Co., Ltd.",
        "parent_zh": "中国长安汽车集团有限公司",
        "jv": [
          {
            "name_en": "Changan Ford Automobile Co., Ltd.",
            "name_zh": "长安福特汽车有限公司",
            "partners": [
              "Changan Automobile / 长安汽车",
              "Ford / 福特"
            ],
            "stake_note": "Changan 50%; Ford 50%. / 长安汽车 50%、福特 50%。"
          },
          {
            "name_en": "Changan Mazda Automobile Co., Ltd.",
            "name_zh": "长安马自达汽车有限公司",
            "partners": [
              "Changan Automobile / 长安汽车",
              "Mazda / 马自达",
              "FAW / 一汽"
            ],
            "stake_note": "Changan 47.5%; Mazda 47.5%; FAW 5%. / 长安汽车 47.5%、马自达 47.5%、一汽 5%。"
          }
        ]
      },
      category: 'group',
      colorA: '#2563eb', colorB: '#111827',
      desc_en: 'Changan Automobile is a Shenzhen-listed automaker under China Changan Automobile Group, which was established in July 2025. Its industrial heritage dates to 1862. Its portfolio includes Changan, Deepal and Nevo/Qiyuan, alongside its investment in Avatr and the Changan Ford and Changan Mazda joint ventures.',
      desc_zh: '长安汽车是深圳上市车企，隶属 2025 年 7 月成立的中国长安汽车集团，工业历史追溯至 1862 年。旗下有长安、深蓝、启源，并投资阿维塔，另有长安福特、长安马自达等合资企业。',
      subBrands_en: 'Changan, Deepal, Avatr, Nevo/Qiyuan',
      subBrands_zh: '长安、深蓝、阿维塔、启源',
      image: 'images/changan-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'xiaomi', name: 'Xiaomi', cn: '小米', founded: 2021, hq: 'Beijing', focus: 'Smart EV',
      entity: {
        "group_en": "Xiaomi Corporation",
        "group_zh": "小米集团",
        "listed": [],
        "parent_en": "Xiaomi Corporation",
        "parent_zh": "小米集团",
        "jv": []
      },
      colorA: '#f97316', colorB: '#0a0a0a',
      desc_en: 'Phone-maker turned car-maker. SU7 sedan and YU7 SUV ignited global attention with Porsche-rivalling performance at half the price.',
      desc_zh: '手机厂跨界造车。SU7 轿车与 YU7 SUV 以保时捷级性能、半价售价引爆全球关注。',
      category: 'startup',
      image: 'images/xiaomi-brand.jpg', imageCredit: 'Xiaomi'
    },
    {
      id: 'gwm', name: 'Great Wall', cn: '长城', founded: 1984, hq: 'Baoding', focus: 'SUV / Pickup',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [
          {
            "exchange": "SSE",
            "code": "601633"
          },
          {
            "exchange": "HKEX",
            "code": "02333"
          }
        ],
        "parent_en": "Baoding Innovation Great Wall Asset Management Company Limited",
        "parent_zh": "保定创新长城资产管理有限公司",
        "jv": [
          {
            "name_en": "Spotlight Automotive Ltd.",
            "name_zh": "光束汽车有限公司",
            "partners": [
              "Great Wall Motor / 长城汽车",
              "BMW Group / 宝马集团"
            ],
            "stake_note": "GWM 50%; BMW 50%. / 长城汽车 50%、宝马 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#84cc16', colorB: '#1a1a1a',
      desc_en: 'Pickup, SUV and off-road specialist. Brands include Haval, Wey, Tank, Ora and Great Wall pickups. Australia, Thailand and Brazil are key overseas bases.',
      desc_zh: '皮卡、SUV 与越野车型专家。旗下包括哈弗、魏牌、坦克、欧拉与长城皮卡，澳洲、泰国、巴西是重要海外支点。',
      subBrands_en: 'Haval, Wey, Tank, Ora, Great Wall Pickup',
      subBrands_zh: '哈弗、魏牌、坦克、欧拉、长城皮卡',
      image: 'images/gwm-brand.jpg', imageCredit: 'Throwawayacc222 / CC0'
    },
    {
      id: 'saic', name: 'SAIC', cn: '上汽', founded: 1955, hq: 'Shanghai', focus: 'State automaker',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [
          {
            "exchange": "SSE",
            "code": "600104"
          }
        ],
        "parent_en": "Shanghai Automotive Industry (Group) Co., Ltd.",
        "parent_zh": "上海汽车工业（集团）有限公司",
        "jv": [
          {
            "name_en": "SAIC Volkswagen Automotive Co., Ltd.",
            "name_zh": "上汽大众汽车有限公司",
            "partners": [
              "SAIC Motor / 上汽集团",
              "Volkswagen Group / 大众汽车集团"
            ],
            "stake_note": "SAIC 50%; Volkswagen Group 50%. / 上汽 50%、大众汽车集团 50%。"
          },
          {
            "name_en": "SAIC General Motors Co., Ltd.",
            "name_zh": "上汽通用汽车有限公司",
            "partners": [
              "SAIC Motor / 上汽集团",
              "General Motors / 通用汽车"
            ],
            "stake_note": "SAIC 50%; GM 50%. / 上汽 50%、通用汽车 50%。"
          },
          {
            "name_en": "SAIC-GM-Wuling Automobile Co., Ltd.",
            "name_zh": "上汽通用五菱汽车股份有限公司",
            "partners": [
              "SAIC Motor / 上汽集团",
              "General Motors / 通用汽车",
              "Guangxi Automobile Group / 广西汽车集团"
            ],
            "stake_note": "SAIC 50.1%; GM 44%; Guangxi Automobile Group 5.9%. / 上汽 50.1%、通用汽车 44%、广西汽车集团 5.9%。"
          }
        ]
      },
      category: 'group',
      colorA: '#8b5cf6', colorB: '#1a1a1a',
      desc_en: 'Shanghai state-owned auto group with Roewe, MG, IM Motors, Rising/Feifan and Maxus, plus major joint-venture systems. MG remains its strongest global volume badge.',
      desc_zh: '上海国有整车集团，覆盖荣威、名爵、智己、飞凡与大通，同时拥有上汽大众、上汽通用等合资体系。MG 是其最强海外销量品牌。',
      subBrands_en: 'Roewe, MG, IM Motors, Rising/Feifan, Maxus',
      subBrands_zh: '荣威、名爵、智己、飞凡、大通',
      image: 'images/saic-brand.jpg', imageCredit: 'Oleg Yunakov / CC BY-SA 4.0'
    },
    {
      id: 'faw', name: 'FAW', cn: '一汽', founded: 1953, hq: 'Changchun', focus: 'State automaker',
      entity: {
        "group_en": "China FAW Group Co., Ltd.",
        "group_zh": "中国第一汽车集团有限公司",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "FAW-Volkswagen Automotive Co., Ltd.",
            "name_zh": "一汽大众汽车有限公司",
            "partners": [
              "China FAW / 中国一汽",
              "Volkswagen Group / 大众汽车集团"
            ],
            "stake_note": "FAW 60%; Volkswagen AG 25%; Audi AG 5%; Volkswagen (China) Investment 10%. / 一汽 60%、大众汽车股份公司 25%、奥迪 5%、大众中国投资 10%。"
          },
          {
            "name_en": "FAW Toyota Motor Co., Ltd.",
            "name_zh": "一汽丰田汽车有限公司",
            "partners": [
              "China FAW / 中国一汽",
              "Toyota / 丰田"
            ],
            "stake_note": "FAW 50%; Toyota 50%. An October 2026 framework envisages GAC acquiring FAW's stake; completion is not confirmed. / 一汽 50%、丰田 50%。2026 年 10 月框架协议拟由广汽收购一汽所持股权，尚未确认交割。"
          }
        ]
      },
      category: 'group',
      colorA: '#b91c1c', colorB: '#111827',
      desc_en: 'China\'s original state auto group. Its main systems include Hongqi, Bestune and Jiefang, plus FAW-Volkswagen and FAW-Toyota joint ventures.',
      desc_zh: '中国最早的国有整车集团之一，核心体系包括红旗、奔腾、解放，以及一汽大众、一汽丰田等合资体系。',
      subBrands_en: 'Hongqi, Bestune, Jiefang',
      subBrands_zh: '红旗、奔腾、解放',
      image: 'images/faw-brand.jpg', imageCredit: 'Benlisquare / CC BY-SA 4.0'
    },
    {
      id: 'gac', name: 'GAC', cn: '广汽', founded: 1997, hq: 'Guangzhou', focus: 'State automaker / EV',
      entity: {
        "group_en": "Guangzhou Automobile Group Co., Ltd.",
        "group_zh": "广州汽车集团股份有限公司",
        "listed": [
          {
            "exchange": "SSE",
            "code": "601238"
          },
          {
            "exchange": "HKEX",
            "code": "02238"
          }
        ],
        "parent_en": "Guangzhou Automobile Industry Group Co., Ltd.",
        "parent_zh": "广州汽车工业集团有限公司",
        "jv": [
          {
            "name_en": "GAC Toyota Motor Co., Ltd.",
            "name_zh": "广汽丰田汽车有限公司",
            "partners": [
              "GAC Group / 广汽集团",
              "Toyota / 丰田"
            ],
            "stake_note": "GAC 50%; Toyota side 50%. / 广汽 50%、丰田方合计 50%。"
          },
          {
            "name_en": "GAC Honda Automobile Co., Ltd.",
            "name_zh": "广汽本田汽车有限公司",
            "partners": [
              "GAC Group / 广汽集团",
              "Honda / 本田"
            ],
            "stake_note": "GAC 50%; Honda side 50%. / 广汽 50%、本田方合计 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#0891b2', colorB: '#111827',
      desc_en: 'Guangzhou-based state auto group with Trumpchi, Aion and Hyptec, plus GAC Toyota and GAC Honda joint ventures. Its NEV strategy is centered on Aion volume and Hyptec premium positioning.',
      desc_zh: '总部位于广州的国有整车集团，覆盖广汽传祺、埃安与昊铂，另有广汽丰田、广汽本田等合资企业。新能源战略以埃安规模化和昊铂高端化为核心。',
      subBrands_en: 'Trumpchi, Aion, Hyptec',
      subBrands_zh: '广汽传祺、埃安、昊铂',
      image: 'images/gac-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },
    {
      id: 'dongfeng', name: 'Dongfeng', cn: '东风', founded: 1969, hq: 'Wuhan', focus: 'State automaker',
      entity: {
        "group_en": "Dongfeng Motor Corporation",
        "group_zh": "东风汽车集团有限公司",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Dongfeng Motor Co., Ltd.",
            "name_zh": "东风汽车有限公司",
            "partners": [
              "Dongfeng / 东风",
              "Nissan / 日产"
            ],
            "stake_note": "Dongfeng 50%; Nissan 50%. Dongfeng Nissan is its passenger-vehicle business. / 东风 50%、日产 50%；东风日产是其乘用车业务。"
          },
          {
            "name_en": "Dongfeng Honda Automobile Co., Ltd.",
            "name_zh": "东风本田汽车有限公司",
            "partners": [
              "Dongfeng / 东风",
              "Honda / 本田"
            ],
            "stake_note": "Dongfeng 50%; Honda Motor 40%; Honda Motor (China) Investment 10%. / 东风 50%、本田技研 40%、本田中国投资 10%。"
          }
        ]
      },
      category: 'group',
      colorA: '#06b6d4', colorB: '#1a1a1a',
      desc_en: 'State auto group with Dongfeng, Voyah, M-Hero, Forthing, eπ, Nammi and Aeolus, plus Dongfeng Nissan and Dongfeng Honda joint ventures.',
      desc_zh: '国有整车集团，覆盖东风、岚图、猛士、风行、奕派、纳米、风神，并拥有东风日产、东风本田等合资体系。',
      subBrands_en: 'Dongfeng, Voyah, M-Hero, Forthing, eπ, Nammi, Aeolus',
      subBrands_zh: '东风、岚图、猛士、风行、奕派、纳米、风神',
      image: 'images/dongfeng-brand.jpg', imageCredit: 'Kevauto / CC BY-SA 4.0'
    },
    {
      id: 'baic', name: 'BAIC', cn: '北汽', founded: 1958, hq: 'Beijing', focus: 'State automaker',
      entity: {
        "group_en": "BAIC Group",
        "group_zh": "北京汽车集团有限公司",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Beijing Benz Automotive Co., Ltd.",
            "name_zh": "北京奔驰汽车有限公司",
            "partners": [
              "BAIC Motor / 北京汽车股份",
              "Mercedes-Benz Group / 梅赛德斯-奔驰集团"
            ],
            "stake_note": "BAIC Motor 51%; Mercedes-Benz side 49%. The Chinese shareholder is BAIC Motor, not BAIC Group directly. / 北京汽车股份 51%、奔驰方合计 49%，中方持股主体为北京汽车股份，并非北汽集团直接持有。"
          },
          {
            "name_en": "Beijing Hyundai Motor Co., Ltd.",
            "name_zh": "北京现代汽车有限公司",
            "partners": [
              "BAIC Investment / 北汽投",
              "Hyundai Motor / 现代汽车"
            ],
            "stake_note": "BAIC Investment (a BAIC Motor subsidiary) 50%; Hyundai Motor 50%. / 北京汽车股份旗下北汽投 50%、现代汽车 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#475569', colorB: '#111827',
      desc_en: 'Beijing state-owned auto group with Beijing Auto, Arcfox and Foton, plus Beijing Benz and Beijing Hyundai joint ventures held through BAIC Motor. BAIC Group and Hong Kong-listed BAIC Motor (1958) are distinct entities.',
      desc_zh: '北京国有整车集团，覆盖北京汽车、极狐与福田，并通过北京汽车股份参与北京奔驰、北京现代等合资企业。北汽集团与香港上市的北京汽车股份（1958）是不同实体。',
      subBrands_en: 'Beijing Auto, Arcfox, Foton',
      subBrands_zh: '北京汽车、极狐、福田',
      image: 'images/baic-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'haval', name: 'Haval', cn: '哈弗', founded: 2013, hq: 'Baoding', focus: 'SUV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#eab308', colorB: '#1a1a1a',
      desc_en: 'Great Wall\'s mainstream SUV brand. Best-selling Chinese SUV brand globally — H6 is a phenomenon in emerging markets.',
      desc_zh: '长城旗下主流 SUV 品牌。全球销量最高的中国 SUV 品牌——H6 在新兴市场表现现象级。',
      image: 'images/haval-brand.jpg', imageCredit: 'Nord794ub / CC BY-SA 4.0'
    },

    // ===== Geely 旗下 =====
    {
      id: 'lynkco', name: 'Lynk & Co', cn: '领克', founded: 2016, hq: 'Hangzhou', focus: 'Crossover / Coupe',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": "Zhejiang ZEEKR Intelligent Technology Co., Ltd.",
        "parent_zh": "浙江极氪智能科技有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#0f766e', colorB: '#0a0a0a',
      desc_en: 'Built on shared CMA technology. Since February 2025, Lynk & Co has been owned 51% by Zhejiang Zeekr and 49% by Ningbo Geely; Volvo Cars exited its former stake. The 09 SUV and 03 sedan defined its sharp, urban design language.',
      desc_zh: '采用共享的 CMA 平台技术。2025 年 2 月起由浙江极氪持股 51%、宁波吉利持股 49%，沃尔沃汽车已退出原有持股。09 SUV 与 03 轿车奠定了犀利都市的设计语言。',
      image: 'images/lynkco-09.jpg', imageCredit: 'Lynk & Co'
    },
    {
      id: 'polestar', name: 'Polestar', cn: '极星', founded: 2017, hq: 'Gothenburg', focus: 'Performance EV',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [
          {
            "exchange": "NASDAQ",
            "code": "PSNY"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#475569', colorB: '#0a0a0a',
      desc_en: 'Volvo\'s former tuning house turned standalone Swedish EV brand under Geely. Polestar 2 took on the Model 3; Polestar 4 introduced the rear-screen-instead-of-window cabin.',
      desc_zh: '原沃尔沃高性能部门，现为吉利旗下独立的瑞典电动品牌。Polestar 2 对标 Model 3，Polestar 4 首创以后视摄像头取代后窗。',
      image: 'images/polestar-4.jpg', imageCredit: 'Polestar'
    },
    {
      id: 'volvo', name: 'Volvo', cn: '沃尔沃', founded: 1927, hq: 'Gothenburg', focus: 'Safety / Premium',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [
          {
            "exchange": "NASDAQ Stockholm",
            "code": "VOLCAR B"
          }
        ],
        "parent_en": "Geely Sweden Holdings AB",
        "parent_zh": "吉利瑞典控股有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#1e3a8a', colorB: '#0a0a0a',
      desc_en: 'Swedish heritage brand owned by Geely since 2010. Pivoting fully electric with the EX90 flagship and the EX30 compact — built in China for global markets.',
      desc_zh: '瑞典传统豪华品牌，2010 年起归属吉利。以 EX90 旗舰与 EX30 紧凑车型全面电动化，在中国生产、销往全球。',
      image: 'images/volvo-ex90.jpg', imageCredit: 'Matti Blume / CC BY-SA'
    },
    {
      id: 'lotus', name: 'Lotus', cn: '路特斯', founded: 1948, hq: 'Hethel', focus: 'Sports / Hyper EV',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#facc15', colorB: '#0a0a0a',
      desc_en: 'British sports-car legend revived by Geely. The Eletre hyper-SUV and Emeya GT mark the all-electric reinvention; the Evija remains its 2,000 hp halo.',
      desc_zh: '英国跑车传奇，由吉利复兴。Eletre 超级 SUV 与 Emeya GT 代表全电动转型，Evija 仍是 2,000 马力的品牌图腾。',
      image: 'images/lotus-eletre.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },

    // ===== Great Wall 旗下 =====
    {
      id: 'tank', name: 'Tank', cn: '坦克', founded: 2021, hq: 'Baoding', focus: 'Off-road SUV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#65a30d', colorB: '#1a1a1a',
      desc_en: 'Great Wall\'s off-road sub-brand. The boxy Tank 300, 500 and 700 channel Defender and G-Wagon DNA — and dominate China\'s overlanding boom.',
      desc_zh: '长城旗下硬派越野品牌。坦克 300、500、700 方盒子造型对标卫士与大 G，主导国内越野潮流。',
      image: 'images/tank-500.jpg', imageCredit: 'Matti Blume / CC BY-SA'
    },
    {
      id: 'wey', name: 'Wey', cn: '魏牌', founded: 2016, hq: 'Baoding', focus: 'Premium PHEV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#b45309', colorB: '#1a1a1a',
      desc_en: 'Great Wall\'s premium PHEV brand named after founder Wei Jianjun. The Blue Mountain (Lanshan) flagship targets Li Auto\'s family-SUV territory.',
      desc_zh: '长城旗下高端插混品牌，得名于创始人魏建军。蓝山旗舰直接对标理想 L8，主攻家庭 SUV 市场。',
      image: 'images/wey-lanshan.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0'
    },
    {
      id: 'ora', name: 'Ora', cn: '欧拉', founded: 2018, hq: 'Baoding', focus: 'Female-focused EV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#ec4899', colorB: '#1a1a1a',
      desc_en: 'Retro-styled compact EV brand from Great Wall, positioned for younger and female drivers. The Good Cat became a viral success in Thailand and Australia.',
      desc_zh: '长城旗下复古风格的紧凑电动车品牌，主打年轻与女性用户。好猫在泰国、澳洲走红出圈。',
      image: 'images/ora-good-cat.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0'
    },

    // ===== BYD 旗下 =====
    {
      id: 'denza', name: 'Denza', cn: '腾势', founded: 2010, hq: 'Shenzhen', focus: 'Premium NEV',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [],
        "parent_en": "BYD Company Limited",
        "parent_zh": "比亚迪股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'BYD', parent_zh: '比亚迪',
      colorA: '#9333ea', colorB: '#0a0a0a',
      desc_en: 'Originally a BYD–Mercedes joint venture, now fully under BYD. The N7 SUV, D9 luxury MPV and Z9GT shooting brake anchor the premium NEV push.',
      desc_zh: '原为比亚迪与奔驰合资品牌，现完全归属比亚迪。N7 SUV、D9 豪华 MPV 与 Z9GT 猎装锚定高端新能源阵地。',
      image: 'images/denza-z9gt.jpg', imageCredit: 'Calreyn88 / CC BY 4.0'
    },
    {
      id: 'yangwang', name: 'Yangwang', cn: '仰望', founded: 2023, hq: 'Shenzhen', focus: 'Ultra-luxury NEV',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [],
        "parent_en": "BYD Company Limited",
        "parent_zh": "比亚迪股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'BYD', parent_zh: '比亚迪',
      colorA: '#a16207', colorB: '#0a0a0a',
      desc_en: 'BYD\'s ultra-luxury halo brand. The U8 SUV can tank-turn and float on water; the U9 supercar hits 309 km/h. Quad-motor e4 platform showcases BYD\'s tech ceiling.',
      desc_zh: '比亚迪的超豪华图腾品牌。U8 SUV 可原地掉头与浮水，U9 超跑突破 309 km/h。四电机 e4 平台展示比亚迪技术天花板。',
      image: 'images/yangwang-u8.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'fangchengbao', name: 'Fang Cheng Bao', cn: '方程豹', founded: 2023, hq: 'Shenzhen', focus: 'Adventure SUV',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [],
        "parent_en": "BYD Company Limited",
        "parent_zh": "比亚迪股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'BYD', parent_zh: '比亚迪',
      colorA: '#16a34a', colorB: '#1a1a1a',
      desc_en: 'BYD\'s personality-driven adventure brand. The boxy Bao 5 and Bao 8 PHEVs sit between Tank and Yangwang — built on the DMO super-hybrid off-road platform.',
      desc_zh: '比亚迪旗下个性化越野品牌。豹 5、豹 8 插混定位于坦克与仰望之间，基于 DMO 超级混动越野平台打造。',
      image: 'images/fangchengbao-5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },

    // ===== SAIC 旗下 =====
    {
      id: 'mg', name: 'MG', cn: '名爵', founded: 1924, hq: 'Shanghai', focus: 'Global affordable EV',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [],
        "parent_en": "SAIC Motor Corporation Limited",
        "parent_zh": "上海汽车集团股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'SAIC', parent_zh: '上汽',
      colorA: '#dc2626', colorB: '#0a0a0a',
      desc_en: 'British heritage brand acquired by Nanjing Automobile in 2005 and brought under SAIC through the 2007 SAIC–Nanjing integration. Cyberster revives the electric convertible roadster.',
      desc_zh: '英国传统汽车品牌，2005 年由南京汽车收购，2007 年随上汽与南汽整合归入上汽。Cyberster 让敞篷跑车以电动形式重生。',
      image: 'images/mg-cyberster.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },
    {
      id: 'maxus', name: 'Maxus', cn: '大通', founded: 2011, hq: 'Shanghai', focus: 'Commercial / MPV',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [],
        "parent_en": "SAIC Motor Corporation Limited",
        "parent_zh": "上海汽车集团股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'SAIC', parent_zh: '上汽',
      colorA: '#0891b2', colorB: '#0a0a0a',
      desc_en: 'SAIC\'s commercial-vehicle and MPV arm. The Mifa 9 luxury electric people-mover and electric pickups have made it a major fleet export brand.',
      desc_zh: '上汽旗下商用与 MPV 品牌。Mifa 9 豪华电动 MPV 与电动皮卡使其成为重要的商用车出口品牌。',
      image: 'images/maxus-mifa9.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0'
    },
    {
      id: 'im', name: 'IM Motors', cn: '智己', founded: 2020, hq: 'Shanghai', focus: 'Smart Luxury EV',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [],
        "parent_en": "SAIC Motor Corporation Limited",
        "parent_zh": "上海汽车集团股份有限公司",
        "jv": [
          {
            "name_en": "IM Motors",
            "name_zh": "智己汽车",
            "partners": [
              "SAIC Motor / 上汽集团",
              "Alibaba Group / 阿里巴巴集团",
              "Zhangjiang Hi-Tech / 张江高科"
            ],
            "stake_note": "Founded jointly in 2020; current ownership percentages are not asserted. / 2020 年由三方共同创立，不据此断言当前持股比例。"
          }
        ]
      },
      category: 'subbrand', parent_en: 'SAIC', parent_zh: '上汽',
      colorA: '#0369a1', colorB: '#0a0a0a',
      desc_en: 'A SAIC + Alibaba + Zhangjiang joint venture targeting smart-luxury EVs. The LS6 SUV and L6 sedan with semi-solid-state batteries showcase next-gen tech.',
      desc_zh: '上汽、阿里巴巴与张江高科合资的高端智能电动品牌。LS6 SUV 与搭载半固态电池的 L6 轿车展示下一代技术。',
      image: 'images/im-ls6.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },

    // ===== Dongfeng 旗下 =====
    {
      id: 'voyah', name: 'Voyah', cn: '岚图', founded: 2018, hq: 'Wuhan', focus: 'Premium NEV',
      entity: {
        "group_en": "Dongfeng Motor Corporation",
        "group_zh": "东风汽车集团有限公司",
        "listed": [
          {
            "exchange": "HKEX",
            "code": "07489"
          }
        ],
        "parent_en": "Dongfeng Motor Corporation",
        "parent_zh": "东风汽车集团有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Dongfeng', parent_zh: '东风',
      colorA: '#7c3aed', colorB: '#0a0a0a',
      desc_en: 'Dongfeng\'s premium new-energy brand. The Free SUV, Dreamer MPV and Zhuiguang sedan compete head-on with NIO and Li Auto in the 300-500k RMB segment.',
      desc_zh: '东风旗下高端新能源品牌。FREE SUV、梦想家 MPV 与追光轿车在 30-50 万元区间与蔚来、理想正面竞争。',
      image: 'images/voyah-free.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'mhero', name: 'M-Hero', cn: '猛士', founded: 2022, hq: 'Wuhan', focus: 'Hardcore off-road',
      entity: {
        "group_en": "Dongfeng Motor Corporation",
        "group_zh": "东风汽车集团有限公司",
        "listed": [],
        "parent_en": "Dongfeng Motor Corporation",
        "parent_zh": "东风汽车集团有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Dongfeng', parent_zh: '东风',
      colorA: '#78350f', colorB: '#1a1a1a',
      desc_en: 'Dongfeng\'s ultra-luxury off-road brand rooted in military vehicle heritage. The M-Hero 917 is a 4-motor 1,088 hp electric Defender-fighter.',
      desc_zh: '东风旗下超豪华越野品牌，源自军车血统。猛士 917 为四电机 1,088 马力电动硬派越野，对标卫士。',
      image: 'images/mhero-917.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0'
    },

    // ===== Chery 旗下 =====
    {
      id: 'omoda', name: 'Omoda', cn: '欧萌达', founded: 2023, hq: 'Wuhu', focus: 'Global crossover',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [],
        "parent_en": "Chery Automobile Co., Ltd.",
        "parent_zh": "奇瑞汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Chery', parent_zh: '奇瑞',
      colorA: '#0d9488', colorB: '#0a0a0a',
      desc_en: 'Chery\'s global-first crossover brand. The Omoda 5 and electric E5 spearhead expansion into the UK, Australia, Latin America and the Middle East.',
      desc_zh: '奇瑞旗下面向全球市场的跨界品牌。Omoda 5 与纯电 E5 主攻英国、澳洲、拉美与中东市场。',
      image: 'images/omoda-e5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'jaecoo', name: 'Jaecoo', cn: '捷酷', founded: 2023, hq: 'Wuhu', focus: 'Rugged SUV',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [],
        "parent_en": "Chery Automobile Co., Ltd.",
        "parent_zh": "奇瑞汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Chery', parent_zh: '奇瑞',
      colorA: '#365314', colorB: '#0a0a0a',
      desc_en: 'Chery\'s rugged-design SUV brand, a sister to Omoda. The Jaecoo 7 PHEV launched in the UK and Europe with 1,200 km combined range.',
      desc_zh: '奇瑞旗下硬派造型 SUV 品牌，与 Omoda 互为兄弟。Jaecoo 7 插混在英国与欧洲上市，综合续航达 1,200 公里。',
      image: 'images/jaecoo-7.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0'
    },
    {
      id: 'exeed', name: 'Exeed', cn: '星途', founded: 2018, hq: 'Wuhu', focus: 'Premium SUV',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [],
        "parent_en": "Chery Automobile Co., Ltd.",
        "parent_zh": "奇瑞汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Chery', parent_zh: '奇瑞',
      colorA: '#be123c', colorB: '#0a0a0a',
      desc_en: 'Chery\'s premium SUV brand. The Exeed VX flagship and Yaoguang/Lanyue line aim upmarket with E0X EV platform and Huawei smart-cabin integration.',
      desc_zh: '奇瑞旗下高端 SUV 品牌。星途 VX 旗舰与瑶光、揽月系列基于 E0X 平台、搭载华为座舱冲击高端市场。',
      image: 'images/exeed-vx.jpg', imageCredit: 'Retired electrician / CC0'
    }
  ],

  // Note: prices are indicative launch/list prices in the named market ("~" = approximate).
  models: [
    // ---- BYD family ----
    {
      id: 'byd-seal', brand: 'BYD', name: 'Seal',
      tag_en: 'The Tesla Model 3 challenger that\'s winning Europe',
      tag_zh: '正在赢得欧洲市场的特斯拉 Model 3 挑战者',
      range: '510–650 km CLTC', accel: '3.8–7.5 s', price: 'US$24,800', priceLocal: '¥179,800 China',
      specNote_en: 'China-market trim range; export WLTP figures differ by market.',
      specNote_zh: '中国市场配置区间；出口版 WLTP 数据因市场而异。',
      body_en: 'Seal is BYD\'s global mid-size electric sedan and the brand\'s most direct answer to the Tesla Model 3. It matters because BYD uses Seal to prove that its Blade Battery, CTB body integration and Ocean-series design can compete in mainstream export markets, not only in China. Specifications vary sharply between entry rear-drive cars and the all-wheel-drive Performance version, so range, acceleration and price should be read as a trim range rather than one combined configuration.',
      body_zh: '海豹是比亚迪面向全球市场的中型纯电轿车，也是比亚迪对标 Tesla Model 3 最直接的车型。它的重要性在于，比亚迪用海豹证明刀片电池、CTB 电池车身一体化和海洋网设计语言不仅能在中国市场成立，也能进入主流出口市场。入门后驱版与四驱性能版的续航、加速和价格差异很大，因此本页参数按配置区间理解，而不是单一车型配置。',
      colorA: '#d4302a', shape: 'sedan',
      image: 'images/byd-seal.jpg', imageCredit: 'BYD',
      names: { cn: '海豹', overseas: [{ name: 'BYD SEAL', markets: ['Europe', 'Netherlands', 'Australia', 'Thailand', 'Singapore'] }] },
      markets: ['Europe', 'Netherlands', 'Australia', 'Thailand', 'Singapore'],
      price_cn: {
        min_cny: 175800,
        max_cny: 239800,
        as_of: '2024-08-08',
        note_en: '2025-model Seal EV, four trims: ¥175,800, ¥189,800, ¥216,800 and ¥239,800.',
        note_zh: '2025 款海豹 EV 共 4 款：17.58 万、18.98 万、21.68 万、23.98 万元。'
      },
      range_note: {
        cltc: { en: '2025-model trims: 510 km (510 Standard), 650 km (650 Long Range / 650 Smart Drive), 600 km (600 AWD Smart Drive).', zh: '2025 款：CLTC 510 km（510 标准版）、650 km（650 长续航版/智驾版）、600 km（600 四驱智驾版）。' },
        wltp: { en: '61.4 kWh rear-wheel drive: 460 km. 82.5 kWh rear-wheel drive: 570 km. All-wheel drive: 520 km. BYD Netherlands price list, May 2026.', zh: '61.4 kWh 后驱 460 km，82.5 kWh 后驱 570 km，四驱 520 km。比亚迪荷兰 2026 年 5 月价格表。' },
        epa: null
      },
      sources: [
        { name: '中国青年网: 比亚迪2025款海豹/海豹07 DM-i上市, 9 August 2024', url: 'https://auto.youth.cn/xw/202408/t20240809_15437236.htm' },
        { name: 'BYD Netherlands SEAL price list, May 2026', url: 'https://www.byd.com/material/byd-site/nl/pdfs/pricelist-may-2026/Prijslijst%20BYD%20SEAL%202026%20per%20Mei%202026%20-%20V1.0.pdf' },
        { name: 'BYD Europe: DOLPHIN and SEAL introduction, 14 April 2023', url: 'https://www.byd.com/eu/news-list/BYD_Introduces_Two_New_Full-electric_Vehicles_in_Europe_BYD_DOLPHIN_and_BYD_SEAL.html' },
        { name: 'BYD Australia: SEAL', url: 'https://bydautomotive.com.au/seal' },
        { name: 'BYD Thailand: SEAL', url: 'https://www.byd.com/en-th/car/seal' },
        { name: 'BYD Singapore: order SEAL', url: 'https://www.byd.com/sg/order-seal' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-seagull', brand: 'BYD', name: 'Seagull',
      tag_en: 'The world\'s most disruptive small EV — exported as the Dolphin Mini.',
      tag_zh: '全球最具颠覆性的小型电动车——海外以 Dolphin Mini 之名出口。',
      range: '305–405 km CLTC', accel: '~12–14 s', price: 'US$9,600', priceLocal: '¥69,800 China',
      specNote_en: 'Entry price is for the lower-range trim; 405 km versions cost more.',
      specNote_zh: '入门价对应低续航配置；405 km 版本价格更高。',
      body_en: 'Seagull is BYD\'s small EV price weapon, exported in several markets as Dolphin Mini. Its significance is not performance but cost structure: LFP battery chemistry, compact packaging and high-volume manufacturing make it one of the clearest examples of China\'s EV affordability advantage. Buyers should not mix the entry price with the longest-range trim, because the 305 km and 405 km versions sit at different price points.',
      body_zh: '海鸥是比亚迪的小型纯电价格武器，在部分海外市场以 Dolphin Mini 名称销售。它的意义不在性能，而在成本结构：磷酸铁锂电池、紧凑封装与大规模制造，让它成为中国电动车价格优势最清晰的样本之一。阅读参数时不应把入门价与最长续航版本混用，因为 305 km 与 405 km 版本处在不同价格档。',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/byd-seagull.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: {
        cn: '海鸥',
        overseas: [
          { name: 'BYD Dolphin Surf', markets: ['Europe'] },
          { name: 'BYD Dolphin Mini', markets: ['Brazil', 'Mexico'] }
        ]
      },
      markets: ['Europe', 'Brazil', 'Mexico'],
      price_cn: {
        min_cny: 69800,
        max_cny: 85800,
        as_of: '2024-08-01',
        note_en: '2025-model Seagull: ¥69,800–¥85,800 (305 km and 405 km versions).',
        note_zh: '2025 款海鸥：6.98–8.58 万元（305 km 与 405 km 两个版本）。'
      },
      range_note: {
        cltc: { en: '2025-model: 305 km and 405 km CLTC (two versions).', zh: '2025 款：CLTC 305 km 与 405 km（两个版本）。' },
        wltp: { en: 'Europe Dolphin Surf Boost (43.2 kWh): 322 km WLTP combined and 502 km WLTP city. BYD, 30 June 2025. Other trims were not stated in that release.', zh: '欧洲 Dolphin Surf Boost（43.2 kWh）：WLTP 综合 322 km，WLTP 城市 502 km。比亚迪 2025-06-30 新闻稿。该稿未给出其他配置。' },
        epa: null
      },
      sources: [
        { name: '中国质量新闻网: 2025款比亚迪海鸥上市, 1 August 2024', url: 'https://m.cqn.com.cn/auto/content/2024-08/01/content_9058992.htm' },
        { name: 'BYD: DOLPHIN MINI launched in Brazil and Mexico', url: 'https://www.byd.com/us/news-list/BYD-DOLPHIN-MINI-Launched-in-Brazil-and-Mexico.html' },
        { name: 'BYD: millionth Dolphin Surf, 30 June 2025', url: 'https://media.byd.com/byd-celebrates-production-of-millionth-record-breaking-dolphin-surf' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-atto-3', brand: 'BYD', name: 'Atto 3',
      tag_en: 'Current export name of this compact SUV. The newer China model is a different car.',
      tag_zh: '这台紧凑型 SUV 的现款出口名。国内新一代是另一台车。',
      range: '暂无数据', accel: '~7.3 s', price: '暂无数据', priceLocal: '',
      specNote_en: 'No verified range or price for the Atto 3 still on sale. The 21 May 2026 China price and the 540 km / 630 km versions belong to the third-generation Yuan Plus, which has not replaced this car.',
      specNote_zh: '仍在售的 Atto 3 没有核实到的续航和价格。2026-05-21 的国内价格，以及 540 km、630 km 两个版本，属于第三代元 PLUS，还没有替换这台车。',
      body_en: 'Atto 3 is BYD\'s most important global compact SUV and one of the first models that made BYD visible to mainstream buyers outside China. It packages the e-Platform 3.0, Blade Battery and a practical crossover body in a format that works for Europe, Southeast Asia, Australia and Latin America. Export-market battery packs, safety equipment and range ratings can differ from China-market data.',
      body_zh: 'Atto 3 是比亚迪最重要的全球紧凑型 SUV，也是比亚迪最早让海外主流消费者感知到的车型之一。它把 e-Platform 3.0、刀片电池和实用跨界车身整合到适合欧洲、东南亚、澳洲和拉美的产品形态中。出口市场的电池包、安全配置与续航测试标准可能与中国市场不同。',
      colorA: '#d4302a', shape: 'suv',
      image: 'images/byd-atto-3.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: {
        cn: '元PLUS',
        overseas: [
          { name: 'BYD Atto 3', markets: ['New Zealand'] },
          { name: 'BYD Atto 5', markets: ['New Zealand'], status: 'planned-next' }
        ]
      },
      markets: ['New Zealand'],
      price_cn: {
        min_cny: null,
        max_cny: null,
        as_of: null,
        note_en: 'Caijing, via Sina on 22 May 2026: the third-generation Yuan Plus launched in China on 21 May 2026 at ¥119,900–¥149,900. That price is not used here as the Atto 3 guide price. Auto Trader New Zealand says the new car reaches New Zealand in 2027 as the Atto 5.',
        note_zh: '新浪 2026-05-22 转财经网：第三代元 PLUS 于 2026-05-21 在国内上市，官方指导价 11.99–14.99 万元。这个价格不写成 Atto 3 的指导价。Auto Trader 新西兰稿称新车 2027 年以 Atto 5 到新西兰。'
      },
      range_note: {
        cltc: null,
        wltp: null,
        epa: null
      },
      sources: [
        { name: '新浪财经: 比亚迪第三代元PLUS 上市, 22 May 2026', url: 'https://finance.sina.com.cn/tech/roll/2026-05-22/doc-inhytkat5913725.shtml' },
        { name: 'Auto Trader NZ: new Yuan Plus confirmed as Atto 5 for 2027, 25 April 2026', url: 'https://autotrader.co.nz/news/exclusive-byds-new-yuan-plus-to-arrive-in-nz-as-atto-5-in-2027' },
        { name: 'electrive: BYD plans overseas Yuan Plus launch as Atto 5, 13 May 2026', url: 'https://www.electrive.com/2026/05/13/byd-plans-to-launch-new-yuan-plus-overseas-as-atto-5/' }
      ],
      status: {
        en: 'The car on this page is still the Atto 3. Caijing, via Sina, says the third-generation Yuan Plus launched in China on 21 May 2026 at ¥119,900–¥149,900, with 540 km and 630 km versions. That article does not name a test cycle, and it does not mention Atto 3 or Atto 5. Auto Trader New Zealand (25 April 2026) says the new car is planned for New Zealand in 2027 as the Atto 5, replacing the current Atto 3, and it calls the 540 km version CLTC.',
        zh: '本页这台车仍是 Atto 3。新浪转财经网称，第三代元 PLUS 于 2026-05-21 在国内上市，官方指导价 11.99–14.99 万元，两个续航版本为 540 km 和 630 km。该稿没有写测试工况，也没有写 Atto 3 或 Atto 5。Auto Trader 新西兰 2026-04-25 稿称，新车计划 2027 年在新西兰以 Atto 5 销售并替换现款 Atto 3，并把 540 km 版本写成 CLTC。'
      },
      powertrain: ['bev']
    },
    {
      id: 'byd-sealion-07', brand: 'BYD', name: 'Sealion 07',
      tag_en: 'Ocean-series coupe SUV aimed squarely at the Tesla Model Y.',
      tag_zh: '海洋网轿跑 SUV，直接对标特斯拉 Model Y。',
      range: '550–610 km CLTC', accel: '4.5–7.3 s', price: 'US$26,200', priceLocal: '¥189,800 China',
      specNote_en: 'Performance acceleration belongs to AWD trims; entry pricing is lower-output RWD.',
      specNote_zh: '高性能加速对应四驱配置；入门价为较低功率后驱配置。',
      body_en: 'Sealion 07 is BYD\'s Ocean-series coupe SUV for the Model Y class. It sits above Atto 3 in size and positioning, and is important because it shows BYD moving from price-led export growth into more design- and performance-led segments. The fastest acceleration figure and the entry price belong to different trims, so this page presents the main China-market specification band.',
      body_zh: '海狮 07 是比亚迪海洋网面向 Model Y 级别的轿跑 SUV，尺寸和定位高于 Atto 3。它的重要性在于，比亚迪正在从价格驱动的出口增长，进入更强调设计、性能与中高端定位的细分市场。最快零百加速与入门价格来自不同配置，因此本页以中国市场主要配置区间展示。',
      colorA: '#1d4ed8', shape: 'suv',
      image: 'images/byd-sealion-07.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0',
      names: { cn: '海狮07 EV', overseas: [{ name: 'BYD Sealion 7', markets: ['Europe', 'Belgium'] }] },
      markets: ['Europe', 'Belgium'],
      price_cn: {
        min_cny: 189800,
        max_cny: 239800,
        as_of: '2025-02-10',
        note_en: '2025-model Smart Drive trims: 550 Smart Cruise ¥189,800, 610 Smart Cruise ¥199,800, 610 Smart Drive ¥219,800, 550 AWD Smart Drive ¥239,800.',
        note_zh: '2025 款智驾版：550 智航版 18.98 万、610 智航版 19.98 万、610 智驾版 21.98 万、550 四驱智驾版 23.98 万元。'
      },
      range_note: {
        cltc: { en: '2025-model trims: 550 km (550 Smart Cruise, 550 AWD) or 610 km (610 Smart Cruise, 610 Smart Drive) CLTC.', zh: '2025 款：CLTC 550 km（550 智航版/四驱）或 610 km（610 智航版/智驾版）。' },
        wltp: { en: 'Comfort rear-wheel drive: 482 km. Design all-wheel drive: 456 km. Excellence all-wheel drive: 502 km.', zh: 'Comfort 后驱 482 km，Design 四驱 456 km，Excellence 四驱 502 km。' },
        epa: null
      },
      sources: [
        { name: 'ZOL: 海狮07 EV 2025 trim list', url: 'https://detail.zol.com.cn/car/index2121160.shtml' },
        { name: 'BitAuto Belgium: Sealion 7', url: 'https://www.bitauto.com/zh-be/byd/sealion-7' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-han', brand: 'BYD', name: 'Han',
      tag_en: 'The flagship sedan that proved a Chinese brand could sell above ¥200K.',
      tag_zh: '证明中国品牌能站稳 20 万元以上市场的旗舰轿车。',
      range: '506–701 km CLTC', accel: '3.9–7.9 s', price: 'US$29,000', priceLocal: '¥209,800 China',
      specNote_en: 'Han EV trim range; DM-i/PHEV variants use different powertrain figures.',
      specNote_zh: '此处为汉 EV 配置区间；DM-i/插混版本动力与续航口径不同。',
      body_en: 'Han is BYD\'s flagship sedan family and one of the models that moved the brand above the budget-EV conversation. It combines executive-sedan dimensions with Blade Battery and high-output electric-drive options, while different EV and plug-in-hybrid versions serve different buyers. The figures here refer to the Han EV range and should not be blended with DM-i/PHEV specifications.',
      body_zh: '汉是比亚迪旗舰轿车家族，也是推动比亚迪跳出低价电动车叙事的关键车型之一。它以行政级轿车尺寸结合刀片电池和高功率电驱，不同纯电与插混版本服务不同用户。本页数据指汉 EV 配置区间，不与 DM-i/插混版本参数混用。',
      colorA: '#111827', shape: 'sedan-long',
      image: 'images/byd-han.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: '汉', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 179800,
        max_cny: 235800,
        as_of: '2024-09-09',
        note_en: '2025-model Han EV, four trims: 506 KM ¥179,800, 605 KM ¥195,800, 701 KM ¥209,800, 701 KM LiDAR Smart Drive ¥235,800. Pure-electric Han only; DM-i/PHEV prices differ.',
        note_zh: '2025 款汉 EV 共 4 款：506KM 17.98 万、605KM 19.58 万、701KM 20.98 万、701KM 激光雷达智驾 23.58 万元。仅纯电版，DM-i 插混价格不同。'
      },
      range_note: {
        cltc: { en: '2025-model Han EV: 506 km, 605 km and 701 km CLTC.', zh: '2025 款汉 EV：CLTC 506 km、605 km、701 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '中国青年网: 2025款比亚迪汉EV 上市, 9 September 2024', url: 'https://auto.youth.cn/xw/202409/t20240910_15508741.htm' },
        { name: '汽车之家: 2025款比亚迪汉 上市, 9 September 2024', url: 'https://m.autohome.com.cn/drive/202409/1300297.html' },
        { name: 'BYD: HAN EV debuts in Brazil', url: 'https://www.byd.com/za/news-list/BYDs-Flagship-HAN-EV-Debuts-in-Brazil' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-shark-6', brand: 'BYD', name: 'Shark 6',
      tag_en: 'PHEV pickup built for Australia and Latin America — a Hilux fighter.',
      tag_zh: '为澳洲与拉美打造的插混皮卡，直面 Hilux。',
      range: '100 km EV / 800+ km', accel: '5.7 s', price: 'US$38,200', priceLocal: 'A$57,900 AU',
      colorA: '#374151', shape: 'suv',
      image: 'images/byd-shark-6.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: { cn: '鲨鱼', overseas: [{ name: 'BYD Shark 6', markets: ['Australia'] }] },
      markets: ['Australia'],
      price_cn: {
        min_cny: null,
        max_cny: null,
        as_of: null,
        note_en: 'Export-first pickup: no China official guide price as of the 29 October 2026 research cutoff.',
        note_zh: '出口优先的皮卡：截至 2026-10-29 研究截止日，中国无官方指导价。'
      },
      range_note: null,
      sources: [
        { name: 'CarExpert: 2026 BYD Shark 6 price and specs, 20 April 2026', url: 'https://www.carexpert.com.au/car-news/2026-byd-shark-6-price-and-specs' },
        { name: 'BYD: Shark 6 official page', url: 'https://www.byd.com/en-kh/car/shark6' }
      ],
      powertrain: ['phev']
    },
    // ---- Xiaomi ----
    {
      id: 'xiaomi-su7', brand: 'Xiaomi', name: 'SU7',
      tag_en: 'The phone-maker\'s first car — 720 km of range and a cult following overnight.',
      tag_zh: '手机厂商的第一台车——720 公里续航，一夜之间成为现象级爆款。',
      range: '720–902 km', accel: '5.28 s', price: 'US$29,800', priceLocal: '¥219,900 China',
      colorA: '#f97316', shape: 'sedan',
      image: 'images/xiaomi-su7.jpg', imageCredit: 'Benlisquare / CC BY-SA 4.0',
      names: { cn: '小米SU7', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 219900,
        max_cny: 303900,
        as_of: '2026-03-19',
        note_en: 'New-generation SU7 (launched 19 March 2026): Standard ¥219,900, Pro ¥249,900, Max ¥303,900.',
        note_zh: '新一代 SU7（2026-03-19 上市）：标准版 21.99 万、Pro 24.99 万、Max 30.39 万元。'
      },
      range_note: {
        cltc: { en: 'Standard 720 km, Pro 902 km, Max 835 km CLTC.', zh: '标准版 720 km、Pro 902 km、Max 835 km（CLTC）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '小米官网: 新一代SU7 配置表', url: 'https://www.xiaomiev.com/xiaomi/car-config' },
        { name: '央广网: 小米新一代SU7 上市, 20 March 2026', url: 'https://www.cnr.cn/2013qcpd/hy/20260320/t20260320_527557055.shtml' },
        { name: 'CnEVPost: Xiaomi Auto global site ahead of 2027 Europe entry, 26 August 2026', url: 'https://cnevpost.com/2026/08/26/xiaomi-auto-launches-global-website-social-channels/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'xiaomi-su7-ultra', brand: 'Xiaomi', name: 'SU7 Ultra',
      tag_en: 'Nürburgring-honed sedan with 1,548 hp. The supercar killer.',
      tag_zh: '在纽北赛道调校、1,548 马力的轿车。超跑杀手。',
      range: '630 km', accel: '1.98 s', price: 'US$73,100', priceLocal: '¥529,900 China',
      colorA: '#f97316', shape: 'sedan',
      image: 'images/xiaomi-su7-ultra.jpg',
      imageCredit: 'Daniel Lu (User:dllu) / CC BY-SA 4.0',
      names: { cn: '小米SU7 Ultra', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 529900,
        max_cny: 814900,
        as_of: '2025-02-27',
        note_en: 'Standard edition ¥529,900; Nürburgring limited edition ¥814,900.',
        note_zh: '标准版 52.99 万，纽北限量版 81.49 万元。'
      },
      range_note: {
        cltc: { en: '630 km CLTC (standard edition); 520 km CLTC (Nürburgring limited edition).', zh: '标准版 CLTC 630 km；纽北限量版 CLTC 520 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '汽车之家: 小米SU7 Ultra 2025款 参数配置', url: 'https://www.autohome.com.cn/config/series/7915.html' },
        { name: '新浪看点: 小米SU7 Ultra 导购（日常摸鱼bot）, 26 October 2026', url: 'https://auto.sina.cn/2026-10-26/detail-iniwpwiv2241307.d.html' },
        { name: 'CnEVPost: Xiaomi Auto global site ahead of 2027 Europe entry, 26 August 2026', url: 'https://cnevpost.com/2026/08/26/xiaomi-auto-launches-global-website-social-channels/' }
      ],
      powertrain: ['bev']
    },
    // ---- NIO family ----
    {
      id: 'nio-et5', brand: 'NIO', name: 'ET5',
      tag_en: 'The volume NIO — swap-capable compact sedan sold across Europe.',
      tag_zh: '蔚来走量担当——支持换电、已进入欧洲多国的中型轿车。',
      range: '585–740 km CLTC', accel: '4.0 s', price: 'US$41,100', priceLocal: '¥298,000 China',
      colorA: '#1d4ed8', shape: 'sedan',
      image: 'images/nio-et5.jpg', imageCredit: 'conceptphoto.info / CC BY 2.0',
      names: { cn: '蔚来ET5', overseas: [{ name: 'NIO ET5', markets: ['Germany'] }] },
      markets: ['Germany'],
      price_cn: {
        min_cny: 298000,
        max_cny: 356000,
        as_of: '2025-05-25',
        note_en: 'New ET5 (2025): whole-vehicle purchase ¥298,000 (75 kWh) or ¥356,000 (100 kWh); BaaS battery rental ¥228,000 (75 kWh) or ¥286,000 (100 kWh).',
        note_zh: '新 ET5（2025 款）整车购买：75 kWh 29.8 万、100 kWh 35.6 万元；BaaS 租电：22.8 万（75 kWh）、28.6 万（100 kWh）。'
      },
      range_note: {
        cltc: { en: '2025-model: 75 kWh 585 km; 100 kWh 740 km CLTC.', zh: '2025 款：75 kWh CLTC 585 km；100 kWh CLTC 740 km。' },
        wltp: { en: 'Standard Range: 456 km WLTP. Long Range: 590 km WLTP. Reported in October 2026 from a German NIO price list.', zh: '标准续航 456 km WLTP，长续航 590 km WLTP。2026 年 10 月报道转述的蔚来德国价格表。' },
        epa: null
      },
      sources: [
        { name: 'NIO 官方: 新ET5/新ET5T 上市, 25 May 2025', url: 'https://www.nio.cn/news/20250525001' },
        { name: '易车: 蔚来ET5 2025款 参数配置', url: 'https://car.m.yiche.com/weilaiet5/m187834/' },
        { name: 'Rouleur Électrique: NIO ET5, updated October 2026', url: 'https://rouleur-electrique.fr/nio/et5/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'nio-et9', brand: 'NIO', name: 'ET9',
      tag_en: 'Flagship saloon with 925V architecture and steer-by-wire.',
      tag_zh: '搭载 925V 高压平台与线控转向的旗舰轿车。',
      range: '650 km', accel: '4.3 s', price: 'US$108,700', priceLocal: '¥788,000 China',
      colorA: '#1d4ed8', shape: 'sedan-long',
      image: 'images/nio-et9.jpg', imageCredit: 'S5A-0043 / CC BY 4.0',
      names: { cn: '蔚来ET9', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 768000,
        max_cny: 838000,
        as_of: '2024-12-21',
        note_en: 'Launched 21 December 2024 from ¥788,000 (BaaS from ¥660,000); first limited edition ¥818,000. Later on-sale range ¥768,000–¥838,000.',
        note_zh: '2024-12-21 上市，78.8 万起（BaaS 66 万起），首发限量版 81.8 万；后续在售区间 76.80–83.80 万元。'
      },
      range_note: {
        cltc: { en: '650 km CLTC (102 kWh standard/signature); 620 km CLTC (first limited edition).', zh: 'CLTC 650 km（102 kWh 标准/签名版）；首发限量版 CLTC 620 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'NIO 官方: ET9 正式上市, 21 December 2024', url: 'https://www.nio.cn/news/20241221003' },
        { name: '汽车之家: 蔚来ET9 参数配置', url: 'https://www.autohome.com.cn/config/series/7546.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'nio-onvo-l60', brand: 'NIO', name: 'Onvo L60',
      tag_en: 'NIO\'s family-SUV sub-brand debut, priced under the Model Y.',
      tag_zh: '蔚来子品牌乐道首款家用 SUV，定价低于 Model Y。',
      range: '525–740 km CLTC', accel: '5.9 s', price: 'US$28,600', priceLocal: '¥206,900 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/nio-onvo-l60.jpg', imageCredit: 'Tim Wu / CC BY-SA 4.0',
      names: { cn: '乐道L60', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 206900,
        max_cny: null,
        as_of: '2025-09-19',
        note_en: 'Whole-vehicle purchase from ¥206,900; BaaS battery rental from ¥149,900 (19 September 2025 release; prices unchanged).',
        note_zh: '整车购买 20.69 万起；BaaS 租电 14.99 万起（2025-09-19 官方稿确认价格保持不变）。'
      },
      range_note: {
        cltc: { en: 'By trim (official config page): 60 kWh 525–560 km; 85 kWh 700–740 km CLTC.', zh: 'CLTC（官方配置表，视配置）：60 kWh 525–560 km；85 kWh 700–740 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '乐道官网: 乐道L60 售价与升级, 19 September 2025', url: 'https://www.onvo.cn/news/20250919001' },
        { name: '乐道官网: L60 详细配置表', url: 'https://configuration.onvo.cn/alpsConfigList?carType=L60' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'nio-firefly', brand: 'NIO', name: 'Firefly',
      tag_en: 'NIO\'s premium small EV for Europe-first expansion.',
      tag_zh: '蔚来面向欧洲市场的高端小车品牌萤火虫。',
      range: '420 km', accel: '~8 s', price: 'US$16,500', priceLocal: '¥119,800 China',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/nio-firefly.jpg', imageCredit: 'Matti Blume / CC BY-SA',
      names: { cn: '萤火虫', overseas: [{ name: 'firefly', markets: [] }] },
      markets: null,
      price_cn: {
        min_cny: 119800,
        max_cny: null,
        as_of: '2025-04-19',
        note_en: 'Vehicle purchase price, not battery lease. Launched 19 April 2025: 42 kWh 自在版 ¥119,800, 发光版 ¥125,800. A 60 kWh version later started at ¥136,800; no full top price was stated.',
        note_zh: '整车购买价，不是 BaaS 租电价。2025-04-19 上市：42 kWh 自在版 11.98 万、发光版 12.58 万元；后续 60 kWh 版本 13.68 万元起，未见顶配封顶价。'
      },
      range_note: {
        cltc: { en: '42 kWh: 420 km CLTC. 60 kWh: 560 km CLTC.', zh: '42 kWh：CLTC 420 km。60 kWh：CLTC 560 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'firefly 萤火虫官方: 首款车型上市, 19 April 2025', url: 'https://firefly.com.cn/news/20250419001' },
        { name: 'IT之家: firefly 60 kWh battery, 23 October 2026', url: 'https://www.ithome.com/1/016/840.htm' }
      ],
      powertrain: ['bev']
    },
    // ---- Xpeng ----
    {
      id: 'xpeng-g6', brand: 'Xpeng', name: 'G6',
      tag_en: 'Coupe-SUV with industry-leading 800V architecture and XNGP city autonomy.',
      tag_zh: '搭载行业领先 800V 高压架构与 XNGP 城市智驾的轿跑 SUV。',
      range: '625–725 km CLTC', accel: '6.3–6.4 s', price: 'US$27,600', priceLocal: '¥199,800 China',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/xpeng-g6.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: '小鹏G6', overseas: [{ name: 'XPENG G6', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: {
        min_cny: 176800,
        max_cny: 198800,
        as_of: '2025-03-13',
        note_en: '2025-model G6, three trims: 625 Long Range Max Tech ¥176,800, 625 Long Range Max Flagship ¥186,800, 725 Ultra Long Range Max Flagship ¥198,800.',
        note_zh: '2025 款 G6 共 3 款：625 长续航 Max 科技版 17.68 万、625 长续航 Max 旗舰版 18.68 万、725 超长续航 Max 旗舰版 19.88 万元。'
      },
      range_note: {
        cltc: { en: '2025-model: 625 km or 725 km CLTC.', zh: '2025 款：CLTC 625 km 或 725 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '小鹏官方: 2025款G6/G9 上市, 13 March 2025', url: 'https://www.xiaopeng.com/news/company_news/5450.html' },
        { name: '小鹏官方: 2025款G6 配置表', url: 'https://www.xiaopeng.com/g6_2025/configuration.html' },
        { name: '小鹏官方: 2025款G6/G9 欧洲上市, 2025', url: 'https://xiaopeng.com/news/company_news/5483.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'xpeng-mona-m03', brand: 'Xpeng', name: 'Mona M03',
      tag_en: 'The sub-¥120K smart sedan that made city-level ADAS affordable.',
      tag_zh: '不到 12 万元的智能轿车，让城市级智驾走进大众市场。',
      range: '510–640 km CLTC', accel: '~7.5 s', price: 'US$16,500', priceLocal: '¥119,800 China',
      colorA: '#22c55e', shape: 'sedan',
      image: 'images/xpeng-mona-m03.jpg', imageCredit: 'S5A-0043 / CC BY 4.0',
      names: { cn: '小鹏MONA M03', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 119800,
        max_cny: 151800,
        as_of: '2026-04-02',
        note_en: '2026-model MONA M03, six trims from ¥119,800 (540 Long Range Plus) to ¥151,800 (610 Ultra Long Range Ultra SE).',
        note_zh: '2026 款 MONA M03 共 6 款，11.98 万（540 长续航 Plus）至 15.18 万元（610 超长续航 Ultra SE）。'
      },
      range_note: {
        cltc: { en: '2026-model: 510 km, 540 km, 610 km or 640 km CLTC depending on trim.', zh: '2026 款：CLTC 510 km、540 km、610 km 或 640 km（视配置）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '小鹏官方: 2026款MONA M03 上市, 2 April 2026', url: 'https://xiaopeng.com/news/company_news/5551.html' }
      ],
      powertrain: ['bev']
    },
    // ---- Li Auto ----
    {
      id: 'li-mega', brand: 'Li Auto', name: 'MEGA',
      tag_en: 'Bullet-train MPV. The most polarising design statement of the year.',
      tag_zh: '高铁造型 MPV。今年最具话题性的设计宣言。',
      range: '710 km', accel: '5.5 s', price: 'US$77,300', priceLocal: '¥559,800 China',
      colorA: '#f59e0b', shape: 'mpv',
      image: 'images/liauto-mega.jpg', imageCredit: '4300streetcar / CC BY 4.0',
      names: { cn: '理想MEGA', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 529800,
        max_cny: 559800,
        as_of: '2024-03-01',
        note_en: 'Launched 1 March 2024 at ¥559,800 (single trim). Current on-sale range ¥529,800–¥559,800.',
        note_zh: '2024-03-01 上市，单一配置 55.98 万；现售区间 52.98–55.98 万元。'
      },
      range_note: {
        cltc: { en: '710 km CLTC (102.7 kWh).', zh: 'CLTC 710 km（102.7 kWh）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '理想汽车官方: 理想MEGA 发布, 1 March 2024', url: 'https://www.lixiang.com/news/93.html' },
        { name: '人民网: 理想MEGA 上市, 13 March 2024', url: 'https://hi.people.com.cn/auto/BIG5/n2/2024/0313/c336668-40773606.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'li-l6', brand: 'Li Auto', name: 'L6',
      tag_en: 'The five-seat EREV SUV that made Li Auto a volume player.',
      tag_zh: '让理想真正走量的五座增程 SUV。',
      range: '1,390 km (EREV)', accel: '5.4 s', price: 'US$34,500', priceLocal: '¥249,800 China',
      colorA: '#f59e0b', shape: 'suv',
      image: 'images/li-l6.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: { cn: '理想L6', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 249800,
        max_cny: 279800,
        as_of: '2024-04-18',
        note_en: 'Pro ¥249,800; Max ¥279,800. Range-extender (EREV).',
        note_zh: 'Pro 24.98 万、Max 27.98 万元。增程式（EREV）。'
      },
      range_note: {
        cltc: { en: '212 km CLTC electric; 1,390 km CLTC combined.', zh: 'CLTC 纯电 212 km；CLTC 综合 1,390 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '理想汽车官方: 理想L6 发布, 18 April 2024', url: 'https://www.lixiang.com/news/97.html' },
        { name: 'Li Auto IR: Li L6 launch', url: 'https://ir.lixiang.com/news-releases/news-release-details/li-auto-inc-launches-li-l6-five-seat-premium-family-suv' }
      ],
      powertrain: ['erev']
    },
    // ---- Zeekr / Lynk & Co ----
    {
      id: 'zeekr-001', brand: 'Zeekr', name: '001',
      tag_en: 'Performance shooting brake. The Porsche Panamera Sport Turismo at 1/3 the price.',
      tag_zh: '高性能猎装车。三分之一价格的保时捷 Panamera Sport Turismo。',
      range: '750 km', accel: '3.3 s', price: 'US$37,100', priceLocal: '¥269,000 China',
      colorA: '#0ea5e9', shape: 'wagon',
      image: 'images/zeekr-001.jpg', imageCredit: 'Юрий Д.К. / CC BY 4.0',
      names: { cn: '极氪001', overseas: [{ name: 'Zeekr 001', markets: ['Italy'] }] },
      markets: ['Italy'],
      price_cn: {
        min_cny: 259000,
        max_cny: 329000,
        as_of: '2024-08-13',
        note_en: '2025-model 001, five trims from ¥259,000 (WE 95 kWh RWD) to ¥329,000 (YOU 100 kWh AWD).',
        note_zh: '2025 款 001 共 5 款，25.9 万（WE 95kWh 后驱）至 32.9 万元（YOU 100kWh 四驱）。'
      },
      range_note: {
        cltc: { en: '2025-model: 722 km (95 kWh RWD), 675 km (95 kWh AWD), 750 km (100 kWh RWD), 705 km (100 kWh AWD) CLTC.', zh: '2025 款：CLTC 722 km（95kWh 后驱）、675 km（95kWh 四驱）、750 km（100kWh 后驱）、705 km（100kWh 四驱）。' },
        wltp: { en: 'Italy, 100 kWh gross: Long Range rear-wheel drive 620 km; Performance all-wheel drive 594 km; Privilege all-wheel drive 585 km WLTP.', zh: '意大利在售、100 kWh（总容量）：Long Range 后驱 WLTP 620 km；Performance 四驱 594 km；Privilege 四驱 585 km。' },
        epa: null
      },
      sources: [
        { name: '太平洋汽车: 2025款极氪001 价格与续航', url: 'https://m.pcauto.com.cn/x/4538/45383039.html' },
        { name: 'Motor1 Italy: Zeekr 001 prices, 27 May 2026', url: 'https://it.motor1.com/news/796976/zeekr-001-prezzo-allestimenti/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'zeekr-7x', brand: 'Zeekr', name: '7X',
      tag_en: 'Mid-size SUV with 800V and a 10-minute 10–80% charge — Europe-bound.',
      tag_zh: '800V 平台、10 分钟 10–80% 快充的中型 SUV，正进军欧洲。',
      range: '780 km', accel: '3.8 s', price: 'US$31,700', priceLocal: '¥229,900 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/zeekr-7x.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: { cn: '极氪7X', overseas: [{ name: 'Zeekr 7X', markets: ['Netherlands', 'Norway', 'Sweden'] }] },
      markets: ['Netherlands', 'Norway', 'Sweden'],
      price_cn: {
        min_cny: 229800,
        max_cny: 269800,
        as_of: null,
        note_en: 'Dealer guide-price table collected on 21 October 2026: ¥229,800, ¥249,800 and ¥269,800.',
        note_zh: '2026-10-21 采集的经销商指导价表：22.98 万、24.98 万、26.98 万元。'
      },
      range_note: {
        cltc: { en: '2026 China trims: 75 kWh rear-wheel drive 702 km; 103 kWh rear-wheel drive 802 km; 103 kWh all-wheel drive 702 km CLTC. The 802 km ceiling is also stated by ZOL.', zh: '2026 款中国配置：75 kWh 后驱 CLTC 702 km；103 kWh 后驱 802 km；103 kWh 四驱 702 km。中关村在线也写了最高 802 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '环球网: 极氪7X 欧洲上市交付, 14 May 2025', url: 'https://tech.huanqiu.com/article/4MfwOZlDn48' },
        { name: 'ZOL Tianjin Zeekr 7X guide prices, collected 21 October 2026', url: 'https://auto.zol.com.cn/1264/12642140_all.html' },
        { name: 'Sina Auto: Zeekr 7X 2026 prices and CLTC', url: 'https://k.sina.cn/article_7857141524_1d452771401902type.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'lynkco-09', brand: 'Lynk & Co', name: '09',
      tag_en: 'Full-size PHEV SUV on Volvo\'s SPA platform — Lynk\'s flagship.',
      tag_zh: '基于沃尔沃 SPA 平台的全尺寸插混 SUV，领克旗舰。',
      range: '150 km EV / 1,400 km', accel: '~6 s', price: '~US$36,700', priceLocal: '¥265,900 China',
      colorA: '#111827', shape: 'suv',
      image: 'images/lynkco-09.jpg', imageCredit: 'Lynk & Co',
      names: { cn: '领克09 EM-P', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 275800,
        max_cny: 275800,
        as_of: '2025-05-16',
        note_en: '2025-model 2.0TD EM-P AWD Max five-seater, single trim at ¥275,800 (limited-time renewal price from ¥235,800).',
        note_zh: '2025 款 2.0TD EM-P 四驱 Max 五座，单一配置 27.58 万（限时焕新价 23.58 万起）。'
      },
      range_note: {
        cltc: { en: '190 km CLTC electric; 1,430 km CLTC combined.', zh: 'CLTC 纯电 190 km；CLTC 综合 1,430 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '中关村在线: 领克09 EM-P 五座Max 上市, 16 May 2025', url: 'https://auto.zol.com.cn/985/9857639.html' },
        { name: '东方汽车: 领克09 EM-P 四驱Max大五座 上市, 16 May 2025', url: 'https://auto.eastday.com/a/n250516163232954.html' },
        { name: '汽车之家: 领克09 EM-P 参数配置', url: 'https://www.autohome.com.cn/config/series/6334.html' }
      ],
      powertrain: ['phev']
    },
    // ---- Geely Galaxy ----
    {
      id: 'geely-galaxy-e5', brand: 'Geely', name: 'Galaxy E5',
      tag_en: 'Geely\'s global compact e-SUV — sold as the EX5 in 50+ markets.',
      tag_zh: '吉利全球化紧凑纯电 SUV——海外以 EX5 之名进入 50 多国。',
      range: '530 km', accel: '~7 s', price: 'US$15,200', priceLocal: '¥109,800 China',
      colorA: '#7c3aed', shape: 'suv',
      image: 'images/geely-galaxy-e5.jpg', imageCredit: 'JustAnotherCarDesigner / CC0',
      names: { cn: '银河E5', overseas: [{ name: 'Geely EX5', markets: ['New Zealand'] }] },
      markets: ['New Zealand'],
      price_cn: {
        min_cny: 109800,
        max_cny: 145800,
        as_of: '2025-07-24',
        note_en: '2026-model E5, five trims from ¥109,800 (530 km Qihang) to ¥145,800 (610 km Xingjian).',
        note_zh: '2026 款 E5 共 5 款，10.98 万（530km 启航版）至 14.58 万元（610km 星舰版）。'
      },
      range_note: {
        cltc: { en: '2026-model: 530 km or 610 km CLTC depending on trim.', zh: '2026 款：CLTC 530 km 或 610 km（视配置）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '汽车之家: 银河E5 2026款 参数配置', url: 'https://www.autohome.com.cn/config/series/7650.html' },
        { name: 'CarExpert New Zealand: 2026 Geely EX5 pricing', url: 'https://www.carexpert.co.nz/geely/ex5/2026/price-and-specs' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'geely-starship-7', brand: 'Geely', name: 'Galaxy Starship 7',
      tag_en: 'Geely Galaxy plug-in hybrid SUV, launched in China on 6 December 2024.',
      tag_zh: '吉利银河插电混动 SUV，2024-12-06 在国内上市。',
      range: '1,420 km', accel: '7.5 s', price: '~US$13,800', priceLocal: '¥99,800–¥132,800',
      specNote_en: '1,420 km is the combined range in the 7 December 2024 China Quality News report. That report does not name a test cycle. 0–100 km/h is 7.5 seconds. ¥99,800–¥132,800 is the limited-time launch price in that report, not a confirmed official guide price.',
      specNote_zh: '1,420 km 是中国质量新闻网 2024-12-07 稿里的综合续航，稿中没有写测试工况。零百加速 7.5 秒。9.98–13.28 万元是该稿的限时先享价，不是已核实的官方指导价。',
      colorA: '#7c3aed', shape: 'suv',
      image: 'images/geely-starship-7.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: { cn: '银河星舰7 EM-i', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: null,
        max_cny: null,
        as_of: null,
        note_en: 'Launched 6 December 2024 in five trims. China Quality News gives a limited-time launch price of ¥99,800–¥132,800 and does not give a separate official guide price. The 55 km and 120 km figures in that report are trim names. Combined range is 1,420 km, with no test cycle named.',
        note_zh: '2024-12-06 上市，五个版型。中国质量新闻网写的是限时先享指导价 9.98–13.28 万元，没有另写官方指导价。稿中的 55 km、120 km 是版型名。综合续航 1,420 km，没有标明测试工况。'
      },
      range_note: {
        cltc: null,
        wltp: null,
        epa: null
      },
      sources: [
        { name: '中国质量新闻网: 银河星舰7 EM-i 上市, 7 December 2024', url: 'https://m.cqn.com.cn/auto/content/2024-12/07/content_9081358.htm' }
      ],
      powertrain: ['phev']
    },
    // ---- Great Wall family ----
    {
      id: 'haval-h6', brand: 'Haval', name: 'H6',
      tag_en: 'The best-selling Chinese SUV abroad — a fixture from Bangkok to Brasília.',
      tag_zh: '海外销量第一的中国 SUV——从曼谷到巴西利亚随处可见。',
      range: 'ICE · HEV · PHEV', accel: '~8 s', price: 'US$13,600', priceLocal: '¥98,900 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/haval-brand.jpg', imageCredit: 'Nord794ub / CC BY-SA 4.0',
      names: { cn: '哈弗H6', overseas: [{ name: 'Haval H6', markets: ['Australia'] }] },
      markets: ['Australia'],
      price_cn: {
        min_cny: 98900,
        max_cny: 143900,
        as_of: '2024-06-19',
        note_en: '2024-model petrol H6 from ¥98,900 (Guochao) to ¥143,900 (2.0T AWD Max); HEV ¥149,800, PHEV ¥159,800–¥173,800.',
        note_zh: '2024 款燃油 H6 约 9.89 万（国潮版）至 14.39 万（2.0T 四驱 Max）；HEV 14.98 万，PHEV 15.98–17.38 万元。'
      },
      range_note: null,
      sources: [
        { name: '太平洋汽车: 哈弗H6 车型与价格', url: 'https://m.pcauto.com.cn/x/4634/46349453.html' }
      ],
      powertrain: ['ice', 'hev', 'phev']
    },
    {
      id: 'tank-300', brand: 'Tank', name: '300',
      tag_en: 'The retro off-roader that started China\'s overlanding boom.',
      tag_zh: '掀起中国越野热潮的复古硬派 SUV。',
      range: 'ICE · Hi4-T PHEV', accel: '~9 s', price: 'US$27,600', priceLocal: '¥199,800 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/tank-300.jpg', imageCredit: 'Jengtingchen / CC BY-SA 4.0',
      names: { cn: '坦克300', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 199800,
        max_cny: 249800,
        as_of: '2025-03-10',
        note_en: '2025-model Tank 300: Challenger ¥199,800, Conqueror ¥216,800, 2.4T diesel ¥234,800, Hi4-T PHEV ¥249,800.',
        note_zh: '2025 款坦克300：挑战者 19.98 万、征服者 21.68 万、2.4T 柴油 23.48 万、Hi4-T 插混 24.98 万元。'
      },
      range_note: {
        cltc: null,
        wltp: null,
        epa: null
      },
      sources: [
        { name: '央视网: 2025款坦克300 上市, 11 March 2025', url: 'https://auto.cctv.cn/2025/03/11/ARTIAJkExIytdAuVQ1W9MZLK250311.shtml' },
        { name: '中国质量新闻网: 2025款坦克300 参数, 18 March 2025', url: 'https://m.cqn.com.cn/auto/content/2025-03/18/content_9097342.htm' }
      ],
      powertrain: ['ice', 'phev']
    },
    {
      id: 'ora-good-cat', brand: 'Ora', name: 'Good Cat',
      tag_en: 'Retro-styled compact EV — a viral hit in Thailand and Australia.',
      tag_zh: '复古造型小车，在泰国与澳洲成为爆款。',
      range: '501 km', accel: '~8.5 s', price: '~US$14,300', priceLocal: '¥103,900 China',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/ora-good-cat.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: { cn: '欧拉好猫', overseas: [{ name: 'Ora Good Cat', markets: ['Thailand', 'Australia'] }] },
      markets: ['Thailand', 'Australia'],
      price_cn: {
        min_cny: 105800,
        max_cny: 135800,
        as_of: '2024-04-26',
        note_en: '2024-model Good Cat, ¥105,800–¥135,800 (GT Mulan edition ¥119,800–¥129,800).',
        note_zh: '2024 款好猫 10.58–13.58 万元（GT 木兰版 11.98–12.98 万元）。'
      },
      range_note: {
        cltc: { en: '401 km or 501 km CLTC.', zh: 'CLTC 401 km 或 501 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '欧拉官方: 2024款好猫 上市, 26 April 2024', url: 'https://www.oraev.com/news_3403334.html' },
        { name: '太平洋汽车: 2024款欧拉好猫 上市', url: 'https://m.pcauto.com.cn/hj/article/2485659.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'wey-lanshan', brand: 'Wey', name: 'Blue Mountain',
      tag_en: 'Great Wall\'s premium PHEV flagship, gunning for Li Auto\'s family crown.',
      tag_zh: '长城高端插混旗舰蓝山，直指理想的家庭市场。',
      range: '221–263 km EV CLTC', accel: '4.9 s', price: 'US$37,800', priceLocal: '¥299,800 China',
      colorA: '#111827', shape: 'suv',
      image: 'images/wey-lanshan.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0',
      names: { cn: '魏牌蓝山', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 299800,
        max_cny: 326800,
        as_of: '2025-05-20',
        note_en: '2025-model Lanshan (焕新版), launched 20 May 2025: Max ¥299,800; Ultra ¥326,800.',
        note_zh: '2025 款蓝山焕新版，2025-05-20 上市：Max 29.98 万、Ultra 32.68 万元。'
      },
      range_note: {
        cltc: { en: '221 km CLTC electric (44.5 kWh Max); 263 km CLTC electric (52.3 kWh Ultra).', zh: 'CLTC 纯电 221 km（44.5 kWh Max）、263 km（52.3 kWh Ultra）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '易车: 魏牌蓝山焕新款 上市, 20 May 2025', url: 'https://www.bitauto.com/article/1003100684208/' },
        { name: 'CarNewsChina: GWM releases new (second-gen) Wey Lanshan, 28 October 2026', url: 'https://carnewschina.com/2026/10/28/gwm-releases-new-wey-lanshan-as-a-luxury-version-of-the-haval-h10/' }
      ],
      status: {
        en: 'Second generation released 28 October 2026 (a luxury version of the Haval H10); due to enter the Chinese market by end of 2026. New battery options: 53.6 kWh (220 km WLTC electric) or 66.6 kWh (270 km WLTC).',
        zh: '第二代已于 2026-10-28 发布（哈弗 H10 的豪华版），预计 2026 年底进入中国市场。新电池 53.6 kWh（WLTC 纯电 220 km）或 66.6 kWh（WLTC 纯电 270 km）。'
      },
      powertrain: ['phev']
    },
    // ---- SAIC family ----
    {
      id: 'mg-mg4', brand: 'MG', name: 'MG4 EV',
      tag_en: 'Europe\'s best-selling Chinese EV — rear-drive, honest, affordable.',
      tag_zh: '欧洲最畅销的中国电动车——后驱、扎实、亲民。',
      range: '450 km (WLTP)', accel: '7.7 s', price: 'US$34,600', priceLocal: '£26,995 UK',
      colorA: '#d4302a', shape: 'suv',
      image: 'images/mg-mg4.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: 'MG4 EV', overseas: [{ name: 'MG4 EV', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: {
        min_cny: 109800,
        max_cny: 156800,
        as_of: '2024-04-24',
        note_en: '2024 China trims: Overseas Champion ¥109,800; 520 km Flagship ¥133,800; AWD Performance ¥156,800. A lower-cost 2026 line (¥68,800–¥102,800) launched 29 August 2025.',
        note_zh: '2024 款：出海冠军版 10.98 万、520km 旗舰版 13.38 万、四驱性能版 15.68 万元。2025-08-29 另上市更低价的 2026 款（6.88–10.28 万元）。'
      },
      range_note: {
        cltc: { en: '2024 China trims: 415 km, 520 km or 460 km CLTC.', zh: '2024 款：CLTC 415 km、520 km 或 460 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '上汽MG官方: MG4 EV 配置表, 24 April 2024', url: 'https://www.saicmg.com/mob/vehicles/sedan/mulan/mulan20240424.pdf' },
        { name: '汽车之家: MG4 EV 2026款 上市与续航', url: 'https://www.autohome.com.cn/ask/24914879.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'mg-cyberster', brand: 'MG', name: 'Cyberster',
      tag_en: 'The electric roadster reviving MG\'s British sports-car soul.',
      tag_zh: '复活 MG 英伦跑车之魂的电动敞篷。',
      range: '580 km', accel: '3.2 s', price: 'US$44,100', priceLocal: '¥319,800 China',
      colorA: '#d4302a', shape: 'sedan',
      image: 'images/mg-cyberster.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: 'MG Cyberster', overseas: [{ name: 'MG Cyberster', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: {
        min_cny: 319800,
        max_cny: 359800,
        as_of: '2023-11-17',
        note_en: 'Three trims: Glamour Edition ¥319,800; Style Edition ¥339,800; Pioneer AWD Edition ¥359,800.',
        note_zh: '三款：魅力心动版 31.98 万、超然致远版 33.98 万、传奇四驱版 35.98 万元。'
      },
      range_note: {
        cltc: { en: '501 km (64 kWh), 580 km (77 kWh RWD) or 520 km (77 kWh AWD) CLTC.', zh: 'CLTC 501 km（64 kWh）、580 km（77 kWh 后驱）或 520 km（77 kWh 四驱）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '上汽MG官方: MG Cyberster 配置表', url: 'https://www.saicmg.com/pc/vehicles/concept/cyberster/js/MG_Cyberster%E9%85%8D%E7%BD%AE%E8%A1%A8.pdf' },
        { name: '国际在线: MG Cyberster 上市, 9 January 2024', url: 'https://auto.cri.cn/20240109/e28de402-aef2-11ae-6f66-8bb1d0c663a8.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'maxus-mifa-9', brand: 'Maxus', name: 'Mifa 9',
      tag_en: 'Luxury electric people-mover — a fleet favourite from Oslo to Sydney.',
      tag_zh: '豪华纯电 MPV——从奥斯陆到悉尼的车队宠儿。',
      range: '560 km', accel: '~8 s', price: 'US$37,200', priceLocal: '¥269,900 China',
      colorA: '#0ea5e9', shape: 'mpv',
      image: 'images/maxus-mifa9.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: { cn: '大家MIFA9', overseas: [{ name: 'MIFA 9', markets: ['Australia', 'Europe'] }] },
      markets: ['Australia', 'Europe'],
      price_cn: {
        min_cny: 269900,
        max_cny: 419900,
        as_of: '2023-06-01',
        note_en: 'June 2023 price list: from ¥269,900 (standard range, 77 kWh) to ¥419,900 (high flagship).',
        note_zh: '2023 年 6 月价格表：26.99 万（标准续航 77 kWh）至 41.99 万元（高山旗舰版）。'
      },
      range_note: {
        cltc: { en: '480 km (77 kWh) or 560 km (90 kWh) CLTC.', zh: 'CLTC 480 km（77 kWh）或 560 km（90 kWh）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '上汽大通官方: 大家MIFA9 配置表, June 2023', url: 'https://www.saicmaxus.com/uploads/month_202306/files/b1fb62e63137922cd9b3e26db6415882.pdf' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'im-ls6', brand: 'IM Motors', name: 'LS6',
      tag_en: 'Smart-luxury SUV with 800V and laser-lidar city driving.',
      tag_zh: '800V 平台 + 激光雷达城市智驾的智己主力 SUV。',
      range: '760 km', accel: '3.5 s', price: 'US$29,700', priceLocal: '¥214,900 China',
      colorA: '#7c3aed', shape: 'suv',
      image: 'images/im-ls6.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: '智己LS6', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 212900,
        max_cny: 284900,
        as_of: '2025-09-10',
        note_en: 'New LS6, nine trims, official guide price ¥212,900–¥284,900 (launch benefit price ¥197,900–¥269,900).',
        note_zh: '全新 LS6 共 9 款，官方指导价 21.29–28.49 万（上市权益价 19.79–26.99 万元）。'
      },
      range_note: {
        cltc: { en: 'Pure-electric: 650 km (76 kWh RWD) or 750 km (103 kWh AWD) CLTC; range-extender 450 km electric.', zh: '纯电版：CLTC 650 km（76 kWh 后驱）或 750 km（103 kWh 四驱）；增程版纯电 450 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '车质网: 全新智己LS6 上市, 16 September 2025', url: 'https://12365auto.com/xcdg/20250916/554953_5.shtml' }
      ],
      powertrain: ['bev']
    },
    // ---- Dongfeng family ----
    {
      id: 'voyah-free', brand: 'Voyah', name: 'Free',
      tag_en: 'Premium EREV SUV — Dongfeng\'s spearhead into Europe via Stellantis.',
      tag_zh: '高端增程 SUV——东风借道 Stellantis 进军欧洲的先锋。',
      range: '106 km EV / 860 km', accel: '4.5 s', price: 'US$30,300', priceLocal: '¥219,900 China',
      colorA: '#1d4ed8', shape: 'suv',
      image: 'images/voyah-free.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: { cn: '岚图FREE', overseas: [{ name: 'Voyah Free', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: {
        min_cny: 219900,
        max_cny: 279900,
        as_of: '2025-07-12',
        note_en: '2025-model FREE+: RWD Qiankun ¥219,900; AWD Qiankun ¥249,900; AWD Sport Custom ¥279,900.',
        note_zh: '2025 款 FREE+：后驱乾崑版 21.99 万、四驱乾崑版 24.99 万、四驱运动定制版 27.99 万元。'
      },
      range_note: {
        cltc: { en: '318 km CLTC electric (RWD) / 259 km (AWD); combined up to 1,458 km.', zh: 'CLTC 纯电 318 km（后驱）/ 259 km（四驱）；综合最高 1,458 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '汽车之家: 岚图FREE 2025款 参数配置', url: 'https://www.autohome.com.cn/config/series/5924.html' },
        { name: '太平洋汽车: 岚图FREE 价格与续航', url: 'https://www.pcauto.com.cn/gl/36988.html' }
      ],
      powertrain: ['erev']
    },
    {
      id: 'mhero-917', brand: 'M-Hero', name: '917',
      tag_en: '1,088 hp quad-motor electric off-roader with military DNA.',
      tag_zh: '1,088 马力四电机硬派越野，军车基因。',
      range: '505 km (BEV) / 200 km EV + 1,026 km (EREV)', accel: '4.2 s', price: 'US$88,000', priceLocal: '¥637,700 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/mhero-917.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0',
      names: { cn: '猛士917', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 637700,
        max_cny: null,
        as_of: '2023-08-25',
        note_en: 'From ¥637,700 (launch starting price). Founders editions: range-extender ¥678,000; pure-electric ¥739,000. The regular pure-electric price was not stated in the source.',
        note_zh: '起售价 63.77 万元。创始版：增程 67.80 万、纯电 73.90 万元。常规纯电版价格出处未给出。'
      },
      range_note: {
        cltc: { en: 'Pure-electric: 505 km CLTC. Range-extender: 200 km CLTC electric, 1,026 km CLTC combined.', zh: '纯电版：CLTC 505 km。增程版：CLTC 纯电 200 km，综合 1,026 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '中国青年网: 猛士917 上市, 26 August 2023', url: 'https://auto.youth.cn/xw/202308/t20230826_14745551.htm' },
        { name: 'Dongfeng Motor: M-Hero 917 global debut, 19 April 2023', url: 'https://www.dfmc.com.cn/news/company/news_20230419_1141.html' }
      ],
      powertrain: ['bev', 'erev']
    },
    // ---- Chery family ----
    {
      id: 'chery-tiggo-8', brand: 'Chery', name: 'Tiggo 8 Pro',
      tag_en: 'Chery\'s 7-seat export workhorse across Russia, MENA and LatAm.',
      tag_zh: '奇瑞出口主力 7 座 SUV，横扫俄罗斯、中东与拉美。',
      range: 'ICE · PHEV', accel: '~8 s', price: '~US$17,900', priceLocal: '¥129,900 China',
      colorA: '#d4302a', shape: 'suv',
      image: 'images/chery-tiggo-8.jpg', imageCredit: 'Matti Blume / CC BY-SA 4.0',
      names: { cn: '瑞虎8 PRO', overseas: [{ name: 'Tiggo 8 Pro', markets: ['Russia', 'Latin America'] }] },
      markets: ['Russia', 'Latin America'],
      price_cn: {
        min_cny: 126900,
        max_cny: 166900,
        as_of: '2023-08-08',
        note_en: '2024-model Champion Edition: ¥126,900 (1.6T 2WD) to ¥166,900 (2.0T AWD).',
        note_zh: '2024 款冠军版：12.69 万（1.6T 两驱）至 16.69 万元（2.0T 四驱）。'
      },
      range_note: null,
      sources: [
        { name: '太平洋汽车: 瑞虎8 PRO 2024款 冠军版 参数', url: 'https://price.pcauto.com.cn/car/sg28464/m124227/' }
      ],
      powertrain: ['ice', 'phev']
    },
    {
      id: 'omoda-e5', brand: 'Omoda', name: 'E5',
      tag_en: 'Electric crossover on sale in the UK with the Omoda 5 since August 2024.',
      tag_zh: '2024 年 8 月起与 Omoda 5 一起在英国销售的纯电跨界车。',
      range: '257 miles (WLTP)', accel: '~7.5 s', price: 'US$42,300', priceLocal: '£33,055 UK',
      specNote_en: 'OMODA UK sales review, 8 January 2025: on sale in the UK from £33,055, WLTP range 257 miles. The same review says the UK launch with the Omoda 5 was in August 2024.',
      specNote_zh: 'OMODA 英国官网 2025-01-08 销售回顾：英国在售，起价 33,055 英镑，WLTP 续航 257 英里。同一篇写明，与 Omoda 5 一起在英国开售是 2024 年 8 月。',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/omoda-e5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: { cn: null, overseas: [{ name: 'Omoda E5', markets: ['United Kingdom'] }] },
      markets: ['United Kingdom'],
      price_cn: {
        min_cny: null,
        max_cny: null,
        as_of: null
      },
      range_note: null,
      sources: [
        { name: 'OMODA UK: UK sales review, 8 January 2025', url: 'https://omodaauto.co.uk/news/omoda-jaecoo-uk-powers-into-2025/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'jaecoo-7', brand: 'Jaecoo', name: '7 SHS-P',
      tag_en: 'Plug-in hybrid on sale in the UK since January 2025. Official name: JAECOO 7 SHS-P.',
      tag_zh: '2025 年 1 月起在英国销售的插电混动车。正式名称是 JAECOO 7 SHS-P。',
      range: '暂无数据', accel: '8.5 s', price: 'US$44,900', priceLocal: '£35,170 UK',
      specNote_en: 'JAECOO UK, 16 June 2026: on sale in the UK since January 2025, from £35,170 OTR, Black Luxury from £36,505 OTR. The release gives 0–62 mph in 8.5 seconds and an 18.4 kWh battery. It does not state an electric-only range or a combined range.',
      specNote_zh: 'JAECOO 英国官网 2026-06-16：2025 年 1 月起在英国销售，起价 35,170 英镑（OTR），Black Luxury 36,505 英镑起。稿中写 0–62 mph 加速 8.5 秒、电池 18.4 kWh，没有写纯电续航或综合续航。',
      colorA: '#374151', shape: 'suv',
      image: 'images/jaecoo-7.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: { cn: null, overseas: [{ name: 'JAECOO 7 SHS-P', markets: ['United Kingdom'] }] },
      markets: ['United Kingdom'],
      price_cn: {
        min_cny: null,
        max_cny: null,
        as_of: null
      },
      range_note: null,
      sources: [
        { name: 'JAECOO UK: JAECOO 7 SHS-P on sale, 16 June 2026', url: 'https://jaecoo.co.uk/news/0-apr-pcp-finance-offers-june-2026/' }
      ],
      powertrain: ['phev']
    },
    // ---- Leapmotor ----
    {
      id: 'leapmotor-c10', brand: 'Leapmotor', name: 'C10',
      tag_en: 'Stellantis-backed family SUV — the value benchmark in Europe.',
      tag_zh: 'Stellantis 加持的家用 SUV——欧洲市场的性价比标杆。',
      range: '530 km', accel: '~7 s', price: 'US$17,800', priceLocal: '¥128,800 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/leapmotor-c10.webp', imageCredit: 'Leapmotor',
      names: { cn: '零跑C10', overseas: [{ name: 'Leapmotor C10', markets: ['Germany'] }] },
      markets: ['Germany'],
      price_cn: {
        min_cny: 128800,
        max_cny: 168800,
        as_of: '2024-03-02',
        note_en: 'BEV ¥128,800–¥168,800; range-extender ¥135,800–¥165,800.',
        note_zh: '纯电 12.88–16.88 万；增程 13.58–16.58 万元。'
      },
      range_note: {
        cltc: { en: 'BEV: up to 530 km CLTC (69.9 kWh). Range-extender: up to 210 km CLTC electric, 1,190 km CLTC combined.', zh: '纯电：CLTC 最高 530 km（69.9 kWh）。增程：CLTC 纯电最高 210 km，综合 1,190 km。' },
        wltp: { en: 'MY27 BEV, Stellantis, 30 September 2026: 69.9 kWh Pro rear-wheel drive 430 km WLTP; 81.9 kWh ProMax rear-wheel drive 519 km WLTP. A range-extender version is also sold. Its 2024 Brussels WLTP figures were marked preliminary, so they are not listed.', zh: '2027 款纯电，Stellantis 2026-09-30：69.9 kWh Pro 后驱 WLTP 430 km；81.9 kWh ProMax 后驱 WLTP 519 km。另有增程版在售。2024 年布鲁塞尔稿把增程 WLTP 标成初步数据，这里不写。' },
        epa: null
      },
      sources: [
        { name: 'Stellantis Media: MY27 Leapmotor C10, 30 September 2026', url: 'https://www.media.stellantis.com/em-en/leapmotor/press/leapmotor-reveals-enhanced-my27-c10-with-greater-range-advanced-connectivity-and-expanded-safety-technologies' },
        { name: 'Stellantis Media Germany: C10 range-extender orders, 10 January 2025', url: 'https://www.media.stellantis.com/de-de/leapmotor/press/leapmotor-auf-dem-bruesseler-autosalon-2025-einfuehrung-des-c10-mit-range-extender' }
      ],
      powertrain: ['bev', 'erev']
    },
    {
      id: 'leapmotor-b10', brand: 'Leapmotor', name: 'B10',
      tag_en: 'The first Chinese EV built in Spain — Stellantis\'s Zaragoza plant.',
      tag_zh: '首批在西班牙本土生产的中国电动车——Stellantis 萨拉戈萨工厂出品。',
      range: '600 km', accel: '~7 s', price: 'US$13,800', priceLocal: '¥99,800 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/leapmotor-b10.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: '零跑B10', overseas: [{ name: 'Leapmotor B10', markets: ['Spain'] }] },
      markets: ['Spain'],
      price_cn: {
        min_cny: 99800,
        max_cny: 125800,
        as_of: '2026-07-16',
        note_en: 'New B10 (2026): ¥99,800–¥125,800, five trims.',
        note_zh: '全新 B10 共 5 款，9.98–12.58 万元。'
      },
      range_note: {
        cltc: { en: '540 km or 610 km CLTC (69.7 kWh).', zh: 'CLTC 540 km 或 610 km（69.7 kWh）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '汽车之家: 零跑B10 参数配置', url: 'https://www.autohome.com.cn/config/series/7877.html' },
        { name: 'Autonoción: Leapmotor B10 built in Spain, 22 October 2026', url: 'https://www.autonocion.com/motornocion/leapmotor-b10-fabricado-espana/' }
      ],
      powertrain: ['bev', 'erev']
    },
    // ---- Geely premium brands ----
    {
      id: 'polestar-4', brand: 'Polestar', name: '4',
      tag_en: 'The coupe-SUV that replaced the rear window with a screen.',
      tag_zh: '用屏幕取代后窗的轿跑 SUV。',
      range: '620 km', accel: '3.8 s', price: 'US$41,400', priceLocal: '¥299,900 China',
      colorA: '#111827', shape: 'suv',
      image: 'images/polestar-4.jpg', imageCredit: 'Polestar',
      names: { cn: 'Polestar 4', overseas: [{ name: 'Polestar 4', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: {
        min_cny: 299900,
        max_cny: 399900,
        as_of: '2023-04-18',
        note_en: 'Four trims from ¥299,900 (single-motor standard range) to ¥399,900 (dual-motor long range PLUS).',
        note_zh: '四款车型，29.99 万（单电机标准续航）至 39.99 万元（双电机长续航 PLUS）。'
      },
      range_note: {
        cltc: { en: 'Single-motor up to 755 km; dual-motor 682 km CLTC (official).', zh: '单电机最高 755 km；双电机 682 km（CLTC，官方）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'Polestar 中国官网: 极星4 技术规格与续航', url: 'https://www.polestar.cn/zh-cn/polestar-4/range-and-charging/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'volvo-ex30', brand: 'Volvo', name: 'EX30',
      tag_en: 'Volvo\'s China-built compact EV — its fastest car ever, at its lowest price.',
      tag_zh: '沃尔沃在华制造的紧凑电动车——史上最快，也最亲民。',
      range: '480 km (WLTP)', accel: '3.6 s', price: 'US$40,200', priceLocal: '€36,590 EU',
      colorA: '#1d4ed8', shape: 'suv',
      image: 'images/volvo-ex30.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: '沃尔沃EX30', overseas: [{ name: 'Volvo EX30', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: {
        min_cny: 200800,
        max_cny: 255800,
        as_of: '2024-05-19',
        note_en: 'RWD Core ¥200,800; RWD Long Range Plus ¥219,800; RWD Long Range Ultra ¥232,800; AWD Performance Ultra ¥255,800.',
        note_zh: '后驱 Core 20.08 万、后驱长续航 Plus 21.98 万、后驱长续航 Ultra 23.28 万、四驱高性能 Ultra 25.58 万元。'
      },
      range_note: {
        cltc: { en: '410 km (49 kWh) or 590 km (66 kWh long range) CLTC.', zh: 'CLTC 410 km（49 kWh）或 590 km（66 kWh 长续航）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '沃尔沃官方: EX30 上市, 19 May 2024', url: 'https://www.volvocars.com.cn/zh-cn/news/technology/Volvo-SUV-EX30/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'lotus-eletre', brand: 'Lotus', name: 'Eletre',
      tag_en: 'A 905-hp hyper-SUV from the house of Chapman, built in Wuhan.',
      tag_zh: '905 马力的超级 SUV，查普曼血统，武汉制造。',
      range: '650 km', accel: '2.95 s', price: 'US$92,200', priceLocal: '¥668,000 China',
      colorA: '#f59e0b', shape: 'suv',
      image: 'images/lotus-eletre.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0',
      names: { cn: '路特斯Eletre', overseas: [{ name: 'Lotus Eletre', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: {
        min_cny: 728000,
        max_cny: 1028000,
        as_of: '2024-01-18',
        note_en: 'Entry ¥728,000 (added 18 January 2024); S+ ¥828,000; R+ ¥1,028,000.',
        note_zh: '入门版 72.8 万（2024-01-18 新增）、S+ 82.8 万、R+ 102.8 万元。'
      },
      range_note: {
        cltc: { en: '650 km CLTC (entry / S+, 112 kWh).', zh: 'CLTC 650 km（入门版 / S+，112 kWh）。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '汽车之家: 路特斯ELETRE 新增入门版, 18 January 2024', url: 'https://www.autohome.com.cn/article?id=-EHoHd2ZsNU=' }
      ],
      powertrain: ['bev']
    },
    // ---- BYD premium brands ----
    {
      id: 'denza-z9gt', brand: 'Denza', name: 'Z9GT',
      tag_en: 'Tri-motor shooting brake with rear-wheel steering — Denza\'s halo.',
      tag_zh: '三电机 + 后轮转向的猎装旗舰，腾势的技术名片。',
      range: '630 km', accel: '3.4 s', price: 'US$46,200', priceLocal: '¥334,800 China',
      colorA: '#111827', shape: 'wagon',
      image: 'images/denza-z9gt.jpg', imageCredit: 'Calreyn88 / CC BY 4.0',
      names: { cn: '腾势Z9GT', overseas: [{ name: 'Denza Z9GT', markets: [] }] },
      markets: null,
      price_cn: {
        min_cny: 329800,
        max_cny: 369800,
        as_of: null,
        note_en: 'These two figures are the all-electric e3 variants in the 9 September 2026 CnEVPost report (¥329,800 and ¥369,800). Plug-in hybrid guide prices were not in the report. The report date is not shown as the official price date.',
        note_zh: '这两个数字是 2026-09-09 CnEVPost 报道里的纯电 e3 版本（32.98 万元和 36.98 万元）。报道未给出插混指导价。发稿日期不写成官方价格日期。'
      },
      range_note: {
        cltc: { en: 'All-electric e3 variants reported on 9 September 2026: new variant 860 km CLTC; Flash Charging Performance 820 km CLTC.', zh: '2026-09-09 报道的纯电 e3 版本：新版本 CLTC 860 km；闪充性能版 CLTC 820 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'CnEVPost: Denza Z9GT e3 variant, 9 September 2026', url: 'https://cnevpost.com/2026/09/09/denza-adds-z9gt-variant-e3-tri-motor/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'yangwang-u8', brand: 'Yangwang', name: 'U8',
      tag_en: 'The SUV that tank-turns and floats — BYD\'s ¥1M statement piece.',
      tag_zh: '能原地掉头、能浮水的 SUV——比亚迪的百万级宣言。',
      range: '180 km EV / 1,000 km', accel: '3.6 s', price: 'US$151,500', priceLocal: '¥1,098,000 China',
      colorA: '#f59e0b', shape: 'suv',
      image: 'images/yangwang-u8.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: { cn: '仰望U8', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 1008000,
        max_cny: 1008000,
        as_of: null,
        note_en: 'CarNewsChina lists one 2026 Standard Edition at ¥1,008,000. Other trims were not on that page. The date on that page was not confirmed as the official price date.',
        note_zh: 'CarNewsChina 列出 2026 款标准版 100.8 万元。该页没有其他配置。页面上的日期没有核实成官方价格日期。'
      },
      range_note: {
        cltc: { en: 'Manufacturer figures listed for the 2026 model: 230 km CLTC electric and 1,205 km CLTC combined.', zh: '2026 款所载厂家口径：CLTC 纯电 230 km，CLTC 综合 1,205 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'CarNewsChina data: Yangwang U8 2026', url: 'https://db.carnewschina.com/yangwang/yangwang-u8' }
      ],
      powertrain: ['erev']
    },
    {
      id: 'fangchengbao-bao5', brand: 'Fang Cheng Bao', name: 'Bao 5',
      tag_en: 'Super-hybrid off-roader on BYD\'s DMO platform — Tank\'s new rival.',
      tag_zh: '基于比亚迪 DMO 平台的超级混动越野，坦克的新对手。',
      range: '125 km EV / 1,200 km', accel: '4.8 s', price: 'US$33,100', priceLocal: '¥239,800 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/fangchengbao-5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: { cn: '方程豹豹5', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 239800,
        max_cny: 329800,
        as_of: null,
        note_en: '2025-model Bao 5: ¥239,800–¥329,800 (per a 27 October 2025 report). Official price date not confirmed.',
        note_zh: '2025 款豹5：23.98–32.98 万元（据 2025-10-27 报道）。官方价格日期未确认。'
      },
      range_note: {
        cltc: { en: '125 km or 210 km CLTC electric; combined over 1,200 km.', zh: 'CLTC 纯电 125 km 或 210 km；综合续航超 1,200 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '汽车之家: 方程豹豹5 2025款 参数配置', url: 'https://www.autohome.com.cn/config/series/7177.html' },
        { name: '腾讯新闻: 方程豹累计销量与豹5售价, 27 October 2025', url: 'https://news.qq.com/rain/a/20251027A03G8T00' }
      ],
      powertrain: ['phev']
    }
  ],

  // Evergreen feature stories — full bodies live in js/stories-data.js (build-time only),
  // pages are generated at /stories/<slug> by build.js.
  features: [
    {
      slug: 'china-ev-battery-supply-chain',
      tag_en: 'Cover', tag_zh: '封面',
      title_en: 'How China Built the World\'s Best EV Battery Supply Chain',
      title_zh: '中国如何打造全球最强的电动车电池供应链',
      desc_en: 'CATL and BYD together produce more than half the world\'s EV batteries. The story of how that dominance was engineered, mine to module.',
      desc_zh: '宁德时代与比亚迪合计生产全球过半电动车电池。从矿山到模组，这是这场主导力如何被构建的故事。',
      meta_en: 'TECHNOLOGY · 8 MIN', meta_zh: '技术 · 8 分钟',
      shape: 'sedan', accent: '#d4302a', large: true,
      image: 'images/byd-seal.jpg', imageCredit: 'BYD'
    },
    {
      slug: 'nio-battery-swap-bet',
      tag_en: 'Brand', tag_zh: '品牌',
      title_en: 'NIO\'s Battery Swap Bet',
      title_zh: '蔚来的换电豪赌',
      desc_en: 'Three minutes, full charge. Why NIO built 3,000 stations — and why CATL and Geely joined in.',
      desc_zh: '三分钟满电。解析蔚来为何投入建设 3,000 座换电站，以及宁德时代、吉利等玩家为何也开始加入换电生态。',
      meta_en: 'PROFILE · 6 MIN', meta_zh: '品牌 · 6 分钟',
      shape: 'sedan-long', accent: '#1d4ed8',
      image: 'images/nio-et9.jpg', imageCredit: 'S5A-0043 / CC BY 4.0'
    },
    {
      slug: 'xiaomi-su7-design',
      tag_en: 'Design', tag_zh: '设计',
      title_en: 'Why Xiaomi\'s SU7 Looks Familiar',
      title_zh: '为什么小米 SU7 看起来眼熟',
      desc_en: 'Inside the design language borrowing from Porsche — and where it diverges.',
      desc_zh: '解析小米 SU7 为何看起来像保时捷：它借鉴了哪些跑车比例，又在哪些智能化与产品定位上形成自己的差异。',
      meta_en: 'DESIGN · 5 MIN', meta_zh: '设计 · 5 分钟',
      shape: 'sedan', accent: '#f97316',
      image: 'images/xiaomi-su7-ultra.jpg', imageCredit: 'Daniel Lu (User:dllu) / CC BY-SA 4.0'
    }
  ],

  news: [
    {
      title_en: 'Chinese EVs Cross 4 Million Annual Exports in 2025',
      title_zh: '2025 年中国电动车出口突破 400 万辆大关',
      excerpt_en: 'China surpassed Japan as the world\'s largest auto exporter for the third consecutive year, with NEV exports growing 38%.',
      excerpt_zh: '中国连续三年超越日本成为全球第一大汽车出口国，新能源车出口同比增长 38%。',
      date: 'May 22, 2026', tag_en: 'Industry', tag_zh: '产业', accent: '#d4302a',
      image: 'images/byd-seal.jpg', imageCredit: 'BYD'
    },
    {
      title_en: 'BYD Opens First European Plant in Hungary',
      title_zh: '比亚迪首座欧洲工厂在匈牙利投产',
      excerpt_en: 'The Szeged facility starts production of the Dolphin and Atto 3 for the European market, bypassing tariffs.',
      excerpt_zh: '塞格德工厂开始为欧洲市场生产海豚与元 Plus，绕开关税壁垒。',
      date: 'May 18, 2026', tag_en: 'Export', tag_zh: '出海', accent: '#1d4ed8',
      image: 'images/byd-brand.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },
    {
      title_en: 'Xpeng MONA M03 Crosses 200K Deliveries in 12 Months',
      title_zh: '小鹏 MONA M03 上市 12 个月交付突破 20 万',
      excerpt_en: 'The sub-$20K smart EV reshaped the entry-level market and proved L2++ autonomy can be democratised.',
      excerpt_zh: '这台不到 13 万元的智能车重塑了入门级市场，证明 L2++ 智驾可以普及。',
      date: 'May 10, 2026', tag_en: 'Launch', tag_zh: '新车', accent: '#22c55e',
      image: 'images/xpeng-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      title_en: 'Solid-State Batteries: CATL and BYD Both Target 2027',
      title_zh: '固态电池：宁德时代与比亚迪同步瞄准 2027',
      excerpt_en: 'Pilot lines are running. Energy density above 400 Wh/kg. The question is no longer "if" but "at what cost".',
      excerpt_zh: '中试线已运行，能量密度突破 400 Wh/kg。问题不再是「能否」，而是「成本」。',
      date: 'May 04, 2026', tag_en: 'Tech', tag_zh: '技术', accent: '#f59e0b',
      image: 'images/yangwang-u8.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      title_en: 'NIO Power Swap Network Hits 3,000 Stations Globally',
      title_zh: '蔚来换电网络全球突破 3,000 座',
      excerpt_en: 'Including 60 stations in Europe. CATL, Geely, and Changan have joined the open swap standard.',
      excerpt_zh: '其中欧洲 60 座。宁德时代、吉利、长安已加入开放换电联盟。',
      date: 'April 28, 2026', tag_en: 'Infrastructure', tag_zh: '基建', accent: '#0ea5e9',
      image: 'images/nio-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    }
  ],

  tech: [
    {
      num: '01', title_en: '800V High-Voltage Architecture', title_zh: '800V 高压平台',
      desc_en: 'China leapfrogged the industry. By 2026, more than 40 Chinese EV models ship with 800V systems enabling 10-minute fast charging. Xpeng, Zeekr, BYD, Li Auto all standardised.',
      desc_zh: '中国已实现弯道超车。到 2026 年，超过 40 款中国电动车型搭载 800V 系统，10 分钟快充成为常态。小鹏、极氪、比亚迪、理想均已普及。',
      tags: ['Silicon Carbide', '5C Charging', '10-Min Refill']
    },
    {
      num: '02', title_en: 'City-Level Autonomous Driving', title_zh: '城市领航辅助驾驶',
      desc_en: 'Xpeng XNGP, Huawei ADS 3.0, NIO NAD — point-to-point urban autonomy without HD maps. The technology that surprised Tesla.',
      desc_zh: '小鹏 XNGP、华为 ADS 3.0、蔚来 NAD——无图城市点到点智驾，让特斯拉感到压力的技术。',
      tags: ['No HD Map', 'BEV+Transformer', 'End-to-End']
    },
    {
      num: '03', title_en: 'Smart Cockpit Revolution', title_zh: '智能座舱革命',
      desc_en: 'Huawei HarmonyOS Cockpit, Xiaomi HyperOS, Li Auto OS — multi-screen, voice-first, app-rich interiors that make legacy infotainment feel a decade behind.',
      desc_zh: '华为鸿蒙座舱、小米澎湃 OS、理想 OS——多屏、语音优先、生态丰富，让传统车机系统瞬间显得落后十年。',
      tags: ['HarmonyOS', 'AI Assistant', 'Multi-Screen']
    },
    {
      num: '04', title_en: 'Blade & Cell-to-Body Batteries', title_zh: '刀片与 CTB 电池',
      desc_en: 'BYD\'s LFP Blade battery and CATL\'s cell-to-body designs deliver safety and density at lower cost. The reason Chinese EVs hit price parity with ICE first.',
      desc_zh: '比亚迪刀片磷酸铁锂电池与宁德时代 CTB 设计——以更低成本实现安全与能量密度，是中国电动车率先与燃油车同价的关键。',
      tags: ['LFP', 'CTB', 'Thermal Safety']
    }
  ]
};
