export const chartResults = {
    'kclique': {
      'Rmat-16': [
        { key: '性能(GTSPS)', value: 50.63 },
        { key: '性能指标要求', value: 20 },
        { key: '性能功耗比(GTSPS/W)', value: 1.915731283 },
        { key: '性能功耗比指标要求', value: 0.5 },
        { key: 'CPU性能(GTSPS)', value: 5.06 },
        { key: 'GPU性能(GTSPS)', value: 25.32 },
        { key: 'CPU功耗比(GTSPS/W)', value: 0.0045 },
        { key: 'GPU功耗比(GTSPS/W)', value: 0.0079 }
      ],
      'Rmat-18': [
        { key: '性能(GTSPS)', value: 51.54 },
        { key: '性能指标要求', value: 20 },
        { key: '性能功耗比(GTSPS/W)', value: 1.950163743 },
        { key: '性能功耗比指标要求', value: 0.5 },
        { key: 'CPU性能(GTSPS)', value: 5.15 },
        { key: 'GPU性能(GTSPS)', value: 25.77 },
        { key: 'CPU功耗比(GTSPS/W)', value: 0.0051 },
        { key: 'GPU功耗比(GTSPS/W)', value: 0.324 }
      ],
      'Rmat-20': [
        { key: '性能(GTSPS)', value: 52.13 },
        { key: '性能指标要求', value: 20 },
        { key: '性能功耗比(GTSPS/W)', value: 1.972488086 },
        { key: '性能功耗比指标要求', value: 0.5 },
        { key: 'CPU性能(GTSPS)', value: 5.21 },
        { key: 'GPU性能(GTSPS)', value: 26.07 },
        { key: 'CPU功耗比(GTSPS/W)', value: 0.0059 },
        { key: 'GPU功耗比(GTSPS/W)', value: 0.323 }
      ],
    },
    'gcn': {
      'Rmat-16': [
        { key: '性能(GOPS)', value: 20.86 },
        { key: '性能指标要求', value: 20 },
        { key: '性能功耗比(GOPS/W)', value: 0.789297937 },
        { key: '性能功耗比指标要求', value: 0.5 },
        { key: 'CPU性能(GOPS)', value: 2.09 },
        { key: 'GPU性能(GOPS)', value: 10.43 },
        { key: 'CPU功耗比(GOPS/W)', value: 0.0048 },
        { key: 'GPU功耗比(GOPS/W)', value: 0.106 }
      ],
      'Rmat-17': [
        { key: '性能(GOPS)', value: 21.05 },
        { key: '性能指标要求', value: 20 },
        { key: '性能功耗比(GOPS/W)', value: 0.796487132 },
        { key: '性能功耗比指标要求', value: 0.5 },
        { key: 'CPU性能(GOPS)', value: 2.10 },
        { key: 'GPU性能(GOPS)', value: 10.53 },
        { key: 'CPU功耗比(GOPS/W)', value: 0.0048 },
        { key: 'GPU功耗比(GOPS/W)', value: 0.083 }
      ],
      'Rmat-18': [
        { key: '性能(GOPS)', value: 20.95 },
        { key: '性能指标要求', value: 20 },
        { key: '性能功耗比(GOPS/W)', value: 0.792703345 },
        { key: '性能功耗比指标要求', value: 0.5 },
        { key: 'CPU性能(GOPS)', value: 2.09 },
        { key: 'GPU性能(GOPS)', value: 10.48 },
        { key: 'CPU功耗比(GOPS/W)', value: 0.0048 },
        { key: 'GPU功耗比(GOPS/W)', value: 0.08 }
      ],
    },
    'ppr': {
      'Rmat-16': [
        { key: '性能(GTEPS)', value: 107.03 },
        { key: '性能指标要求', value: 100 },
        { key: '性能功耗比(GTEPS/W)', value: 4.049787067 },
        { key: '性能功耗比指标要求', value: 2.5 },
        { key: 'CPU性能(GTEPS)', value: 10.70 },
        { key: 'GPU性能(GTEPS)', value: 53.52 },
        { key: 'CPU功耗比(GTEPS/W)', value: 0.0078 },
        { key: 'GPU功耗比(GTEPS/W)', value: 0.082 }
      ],
      'Rmat-18': [
        { key: '性能(GTEPS)', value: 101.2 },
        { key: '性能指标要求', value: 100 },
        { key: '性能功耗比(GTEPS/W)', value: 3.829192294 },
        { key: '性能功耗比指标要求', value: 2.5 },
        { key: 'CPU性能(GTEPS)', value: 10.12 },
        { key: 'GPU性能(GTEPS)', value: 50.60 },
        { key: 'CPU功耗比(GTEPS/W)', value: 0.0045 },
        { key: 'GPU功耗比(GTEPS/W)', value: 0.223 }
      ],
      'Rmat-20': [
        { key: '性能(GTEPS)', value: 176.75 },
        { key: '性能指标要求', value: 100 },
        { key: '性能功耗比(GTEPS/W)', value: 6.68784326 },
        { key: '性能功耗比指标要求', value: 2.5 },
        { key: 'CPU性能(GTEPS)', value: 17.67 },
        { key: 'GPU性能(GTEPS)', value: 88.38 },
        { key: 'CPU功耗比(GTEPS/W)', value: 0.005 },
        { key: 'GPU功耗比(GTEPS/W)', value: 0.441 }
      ],
    }
};

// 算法名称映射
export const algorithmNameMapping = {
  'bfs': 'BFS',
  'sssp': 'SSSP', 
  'wcc': 'WCC',
  'kcore': 'K-Core',
  'kclique': 'K-Clique',
  'ppr': 'PageRank',
  'gcn': 'GCN'
};

// 默认性能值 - 按算法和数据集区分
export const defaultPerformanceValues = {
  'bfs': {
    'smallgraph': {
      performance: {
        '150MHz': 0.002,
        '1000MHz': 0.015
      },
      consumption: 0.005,
      target: {
        performance: 0.01,
        consumption: 0.003
      },
      unit: 'GTEPS'
    },
    'facebook': {
      performance: {
        '150MHz': 1.8,
        '1000MHz': 12.0
      },
      consumption: 4.5,
      target: {
        performance: 10.0,
        consumption: 3.0
      },
      unit: 'GTEPS'
    },
    'physics': {
      performance: {
        '150MHz': 0.9,
        '1000MHz': 6.0
      },
      consumption: 2.2,
      target: {
        performance: 5.0,
        consumption: 1.5
      },
      unit: 'GTEPS'
    }
  },
  'sssp': {
    'smallgraph': {
      performance: {
        '150MHz': 0.0025,
        '1000MHz': 0.0165
      },
      consumption: 0.006,
      target: {
        performance: 0.015,
        consumption: 0.004
      },
      unit: 'GTEPS'
    },
    'facebook': {
      performance: {
        '150MHz': 2.2,
        '1000MHz': 14.5
      },
      consumption: 5.5,
      target: {
        performance: 12.0,
        consumption: 4.0
      },
      unit: 'GTEPS'
    },
    'physics': {
      performance: {
        '150MHz': 1.1,
        '1000MHz': 7.3
      },
      consumption: 2.7,
      target: {
        performance: 6.0,
        consumption: 2.0
      },
      unit: 'GTEPS'
    }
  },
  'wcc': {
    'euroroad': {
      performance: {
        '150MHz': 0.3,
        '1000MHz': 2.0
      },
      consumption: 0.7,
      target: {
        performance: 1.5,
        consumption: 0.5
      },
      unit: 'GTEPS'
    },
    'pdzbase': {
      performance: {
        '150MHz': 0.6,
        '1000MHz': 4.0
      },
      consumption: 1.5,
      target: {
        performance: 3.0,
        consumption: 1.0
      },
      unit: 'GTEPS'
    },
    'facebook': {
      performance: {
        '150MHz': 1.5,
        '1000MHz': 10.0
      },
      consumption: 3.7,
      target: {
        performance: 8.0,
        consumption: 2.5
      },
      unit: 'GTEPS'
    }
  },
  'kcore': {
    'physics': {
      performance: {
        '150MHz': 0.5,
        '1000MHz': 3.3
      },
      consumption: 1.2,
      target: {
        performance: 2.5,
        consumption: 0.8
      },
      unit: 'GTEPS'
    },
    'facebook': {
      performance: {
        '150MHz': 0.8,
        '1000MHz': 5.3
      },
      consumption: 2.0,
      target: {
        performance: 4.0,
        consumption: 1.2
      },
      unit: 'GTEPS'
    }
  },
  'kclique': {
    'Rmat-16': {
      performance: {
        '150MHz': 7.5,
        '1000MHz': 50.0
      },
      consumption: 1.9,
      target: {
        performance: 20.0,
        consumption: 0.5
      },
      unit: 'GTSPS'
    },
    'Rmat-18': {
      performance: {
        '150MHz': 7.7,
        '1000MHz': 51.5
      },
      consumption: 1.95,
      target: {
        performance: 20.0,
        consumption: 0.5
      },
      unit: 'GTSPS'
    },
    'Rmat-20': {
      performance: {
        '150MHz': 7.8,
        '1000MHz': 52.0
      },
      consumption: 1.97,
      target: {
        performance: 20.0,
        consumption: 0.5
      },
      unit: 'GTSPS'
    },
    'euroroad': {
      performance: {
        '150MHz': 0.6609,
        '1000MHz': 0.905
      },
      consumption: 1.2,
      target: {
        performance: 15.0,
        consumption: 0.4
      },
      unit: 'GTSPS'
    },
    'physics': {
      performance: {
        '150MHz': 0.7448,
        '1000MHz': 0.7729
      },
      consumption: 1.5,
      target: {
        performance: 18.0,
        consumption: 0.45
      },
      unit: 'GTSPS'
    }
  },
  'ppr': {
    'Rmat-16': {
      performance: {
        '150MHz': 16.0,
        '1000MHz': 107.0
      },
      consumption: 4.0,
      target: {
        performance: 100.0,
        consumption: 2.5
      },
      unit: 'GTEPS'
    },
    'Rmat-18': {
      performance: {
        '150MHz': 15.0,
        '1000MHz': 101.0
      },
      consumption: 3.8,
      target: {
        performance: 100.0,
        consumption: 2.5
      },
      unit: 'GTEPS'
    },
    'Rmat-20': {
      performance: {
        '150MHz': 26.5,
        '1000MHz': 176.5
      },
      consumption: 6.7,
      target: {
        performance: 100.0,
        consumption: 2.5
      },
      unit: 'GTEPS'
    },
    'smallgraph': {
      performance: {
        '150MHz': 0.013,
        '1000MHz': 0.089
      },
      consumption: 0.8,
      target: {
        performance: 15.0,
        consumption: 0.5
      },
      unit: 'GTEPS'
    },
    'physics': {
      performance: {
        '150MHz': 10.0,
        '1000MHz': 65.0
      },
      consumption: 2.5,
      target: {
        performance: 50.0,
        consumption: 1.5
      },
      unit: 'GTEPS'
    },
    'facebook': {
      performance: {
        '150MHz': 12.0,
        '1000MHz': 80.0
      },
      consumption: 3.0,
      target: {
        performance: 60.0,
        consumption: 1.8
      },
      unit: 'GTEPS'
    }
  },
  'gcn': {
    'Rmat-16': {
      performance: {
        '150MHz': 3.1,
        '1000MHz': 20.9
      },
      consumption: 0.79,
      target: {
        performance: 20.0,
        consumption: 0.5
      },
      unit: 'GOPS'
    },
    'Rmat-17': {
      performance: {
        '150MHz': 3.15,
        '1000MHz': 21.0
      },
      consumption: 0.8,
      target: {
        performance: 20.0,
        consumption: 0.5
      },
      unit: 'GOPS'
    },
    'Rmat-18': {
      performance: {
        '150MHz': 3.14,
        '1000MHz': 20.9
      },
      consumption: 0.79,
      target: {
        performance: 20.0,
        consumption: 0.5
      },
      unit: 'GOPS'
    },
    'cora': {
      performance: {
        '150MHz': 2.0,
        '1000MHz': 13.0
      },
      consumption: 0.5,
      target: {
        performance: 10.0,
        consumption: 0.3
      },
      unit: 'GOPS'
    }
  }
};
  