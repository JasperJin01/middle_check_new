// 代码数据
export const codeData = {
    'device-cga': {
      'bfs': `from graph_dsl import *

class BFSKernel(GraphTraversalKernel):
  def __init__(self, 
               dev_graph : Graph, 
               dev_depth : vec_int, 
               dev_root : int):                  
    super().__init__(dev_graph, CHANGED_MODE, 
                     PUSH, DEFAULT_EDGE_PROP)
    self.root : int = dev_root
    self.depth : vec_int = dev_depth

    self.CGAprop: GraphTraversalProPerty =()
    self.CGAprop.res = ()
    self.CGAprop.frontier = FrontierFromRoot(self.root)
    self.CGAprop.end_tag  = self.CGAprop.frontier.isempty()
    self.CGAprop.maxiter = 100
    self.CGAprop.ret_value = self.depth
        
  def gather_mult(msg, weight):
    return msg + 1 
  
  def gather_add(res1, res2):
    return min(res1, res2)
  
  def construct(self):
    return self.depth
  
  def apply(self):
    self.depth = min(self.depth, self.CGAprop.res)
    return self.depth`,
      'sssp': '// 这里应该是SSSP的CGA代码',
      'wcc': '// 这里应该是WCC的CGA代码',
      'kcore': '// 这里应该是K-Core的CGA代码',
      'kclique': '// 这里应该是K-Clique的CGA代码',
      'ppr': '// 这里应该是PPR的CGA代码',
      'gcn': '// 这里应该是GCN的CGA代码',
      'custom': `from graph_dsl import *

class GraphAlgorithm(GraphTraversalKernel):
    """图算法演示模板"""

    def __init__(self, graph: Graph, ​**kwargs):
        """
        初始化图数据和算法参数
        - graph: 输入的图结构
        - kwargs: 其他可选参数（如距离、标签、起始点、遍历方向等）
        """
        super().__init__(graph, ​**kwargs)
        self.graph = graph

        # 初始化算法控制参数
        self.frontier = ...  # 遍历边界
        self.max_iter = ...  # 最大迭代次数

    def gather_mult(self, msg, weight):
        """
        定义边上的计算逻辑
        - msg: 从源顶点发送的值
        - weight: 边权重
        - 返回: 传递给目标顶点的值
        """
        pass

    def gather_add(self, res1, res2):
        """
        定义顶点上的聚合逻辑
        - res1, res2: 来自不同边的计算结果
        - 返回: 聚合后的值（如 min/max/sum）
        """
        pass

    def apply(self):
        """
        定义每次迭代后如何更新顶点属性
        - 通常合并临时结果到主属性（如 self.prop）
        """
        pass

    def construct(self):
        """
        定义算法的返回值
        - 通常返回顶点属性（如距离数组、标签数组等）
        - 可在此方法中对结果做最终处理
        """
        pass`,
      'framework': '// 这里应该是框架转换生成的代码'
    },
    'host-code': {
      'default': `Input: Graph G, number of iterations iter
Output: Final result after iter iterations or when the computation finishes early

GlobalGraph globalGraph;
DistGraph distGraph;
LocalGraph localGraph;

globalGraph.deliverPartition(&distGraph);
distGraph.MPI_init(&argc, &argv);
Define world_size, world_rank;
distGraph.MPI_local_rank(world_size, &local_rank);
SetDevice(local_rank);
localGraph.graph_partition();
MemcpyH2D(partition);

for i ← 0 to iter - 1 do
    MemcpyH2D(graph);
    launch_kernel(CGA_kernel());
    MemcpyD2H();
    distGraph.MPI_Comm();
    if finish then
        break;

distGraph.MPI_Finalize();`
    },
    'graph-ir': {
      'bfs': `module {
  func.func @GraphTraversalKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 1 : i32, data_name = "self.root", data_tag = "scalar"}> : () -> i32
    %2 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.depth", data_tag = "vector"}> : () -> tensor<*xi32>
    graph.data_label_end
    %3 = "graph.LoadFromSpm"(%1) <{spm_loc = "self.root"}> : (i32) -> i32
    "graph.FrontierFromRoot"(%3) : (i32) -> ()
    %c100_i32 = arith.constant 100 : i32
    %c0_i32 = arith.constant 0 : i32
    %c1_i32 = arith.constant 1 : i32
    scf.for %arg0 = %c0_i32 to %c100_i32 step %c1_i32  : i32 {
      "graph.GrunEndTag"() <{EndTag = "frontier_empty"}> : () -> ()
      %4 = "graph.kernel_gc"(%2) <{active_mode = "CHANGED_MODE", direction_mode = "PUSH", edge_value = "DEFAULT_EDGE_PROP", gather_add_mode = "Min_", gather_mult_mode = "Add_One_"}> : (tensor<*xi32>) -> tensor<*xi32>
      %5 = "graph.LoadFromSpm"(%2) <{spm_loc = "self.depth"}> : (tensor<*xi32>) -> tensor<*xi32>
      %6 = "graph.min"(%5, %4) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
      "graph.StoreToSpm"(%6) <{spm_loc = "self.depth"}> : (tensor<*xi32>) -> ()
      "graph.FrontierFromPropChanged"(%6) : (tensor<*xi32>) -> ()
    }
    graph.return %2 : tensor<*xi32>
    return
  }
}
`,
      'sssp': '// 这里应该是SSSP的GraphIR代码',
      'wcc': '// 这里应该是WCC的GraphIR代码',
      'kcore': '// 这里应该是K-Core的GraphIR代码',
      'kclique': '// 这里应该是K-Clique的GraphIR代码',
      'ppr': '// 这里应该是PPR的GraphIR代码',
      'gcn': '// 这里应该是GCN的GraphIR代码'
    },
    'matrix-ir': {
      'bfs': `module {
  func.func @GraphTraversalKernel() {
    %0 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum", data_tag = "Input"}> : () -> i32
    %1 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum_Aligned", data_tag = "Input"}> : () -> i32
    %2 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "self.root", data_tag = "scalar"}> : () -> i32
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %3 = "matrix.SLOAD"() <{spm_loc = "VertexNum_Aligned"}> : () -> i32
    %4 = "matrix.SDMAL2V"(%3) <{data_name = "OFF_ST", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %5 = "matrix.SDMAL2V"(%3) <{data_name = "OFF_ED", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %6 = "matrix.SDMAL2V"(%3) <{data_name = "NEW_V", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %7 = "matrix.SDMAL2V"(%3) <{data_name = "self.depth", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %8 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Zero"}> : () -> i32
    %9 = "matrix.SLOAD"() <{spm_loc = "VertexNum"}> : () -> i32
    %10 = "matrix.QFULLMASK"(%8, %9) <{to_special_queue = "Special_Queue"}> : (i32, i32) -> tensor<*xi32>
    %11 = matrix.QUEUEZERO : tensor<*xi32>
    graph.data_label_end
    %12 = "matrix.SLOAD"() <{spm_loc = "self.root"}> : () -> i32
    %13 = "matrix.SADDI"(%12) <{constscalar = 1 : i32}> : (i32) -> i32
    %14 = "matrix.QGENIDS"(%12, %13) <{to_special_queue = "Active_Queue_24"}> : (i32, i32) -> tensor<*xi32>
    "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode MIN>, edge_fifo = #matrix<edge_fifo_mode OFF>, mul_alu = #matrix<mul_alu_mode PLUS1>, traversal_dirc = #matrix<tr_dirc_mode PUSH>}> : () -> ()
    %15 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Scf.for args2"}> : () -> i32
    %16 = "matrix.SMOVI"() <{assignvalue = 100 : i32, mode = "IMM", name = "Scf.for args3"}> : () -> i32
    matrix.op_label {str = "Entry_1"}
    matrix.SBEQ %15 : i32, %16 : i32 {label = "Exit_1"}
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %17 = "matrix.Q2SCHCKE"() <{special_queue = "Active_Queue_24"}> {name = "VertexNum"} : () -> i32
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %18 = "matrix.SBGT"(%17) <{cmp_val = 0 : i32, label = "Exit_1"}> : (i32) -> i32
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %19:2 = "matrix.QFORKFS"() <{special_queue = "Active_Queue_24"}> : () -> (tensor<*xi32>, tensor<*xi32>)
    %20:2 = "matrix.QFORK"(%19#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %21:2 = "matrix.QFORK"(%19#1) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %22 = "matrix.QLOAD"(%20#0) <{spm_loc = "OFF_ST"}> : (tensor<*xi32>) -> tensor<*xi32>
    %23 = "matrix.QLOAD"(%21#0) <{spm_loc = "OFF_ED"}> : (tensor<*xi32>) -> tensor<*xi32>
    %24 = "matrix.QLOAD"(%21#1) <{spm_loc = "self.depth"}> : (tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSQMOV"(%20#1) <{graph_queue_id = 26 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%22) <{graph_queue_id = 27 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%23) <{graph_queue_id = 28 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%24) <{graph_queue_id = 29 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.GRUN"() <{OutputSpm = "NEW_V"}> : () -> ()
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    "matrix.WAITSQ"() <{wait_queue = "Graph_Queue_id"}> : () -> ()
    %25 = "matrix.QGENIDI"(%8, %9) : (i32, i32) -> tensor<*xi32>
    %26:2 = "matrix.QFORK"(%25) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %27:2 = "matrix.QFORK"(%26#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %28:2 = "matrix.QLOAD"(%26#1) <{spm_loc = "NEW_V"}> : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %29 = "matrix.QLOAD"(%27#0) <{spm_loc = "self.depth"}> : (tensor<*xi32>) -> tensor<*xi32>
    %30 = "matrix.QSLT"(%28#0, %29) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %31:2 = "matrix.QFORK"(%30) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %32 = "matrix.QFILTER"(%27#1, %31#0) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %33 = "matrix.QFORKTS"(%32) <{special_queue = "Active_Queue_24"}> : (tensor<*xi32>) -> tensor<*xi32>
    %34 = "matrix.QFILTER"(%28#1, %31#1) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSTORE"(%33, %34) <{spm_loc = "self.depth"}> : (tensor<*xi32>, tensor<*xi32>) -> ()
    "matrix.WAITQ"(%33) : (tensor<*xi32>) -> ()
    "matrix.AUG_ADDI"(%15) <{constscalar = 1 : i32}> : (i32) -> ()
    matrix.SNOP
    %35 = matrix.SJAL {str = "Entry_1"} : i32
    matrix.op_label {str = "Exit_1"}
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    "matrix.SDMAV2L"(%3) <{data_name = "self.depth", data_tag = "vector"}> : (i32) -> ()
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    return
  }
}
`,
      'sssp': '// 这里应该是SSSP的MatrixIR代码',
      'wcc': '// 这里应该是WCC的MatrixIR代码',
      'kcore': '// 这里应该是K-Core的MatrixIR代码',
      'kclique': '// 这里应该是K-Clique的MatrixIR代码',
      'ppr': '// 这里应该是PPR的MatrixIR代码',
      'gcn': '// 这里应该是GCN的MatrixIR代码'
    },
    'hardware-instruction': {
      'bfs': `SMOVI S1, 0
SMOVI S2, 0
SMOVI S3, 64
SDMAL2S S1, S2, S3, 0
SMOVI S1, 256
SMOVI S2, 256
SMOVI S3, 64
SDMAL2S S1, S2, S3, 0
SMOVI S1, 512
SMOVI S2, 512
SMOVI S3, 64
SDMAL2S S1, S2, S3, 0
SDMABARRIER
SNOP
SNOP
SLOAD S1, S0, 256
SMOVI S14, 0
SMOVI S15, 4194304
SDMAL2V S14, S15, S1, 0
SMOVI S14, 4194304
SMOVI S15, 8388608
SDMAL2V S14, S15, S1, 0
SMOVI S14, 8388608
SMOVI S15, 12582912
SDMAL2V S14, S15, S1, 0
SMOVI S14, 12582912
SMOVI S15, 16777216
SDMAL2V S14, S15, S1, 0
SDMABARRIER
SNOP
SNOP
SMOVI S2, 0
SLOAD S3, S0, 0
SLOAD S4, S0, 512
SADDI S5, S4, 1
QGENID Q24, S4, S5
GCFGI C1, 8388608
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 0
GCFGI C5, 0
GCFGI C6, 0
GCFGI C7, 25165824
GCFGI C8, 0
GCFGI C9, 0
SMOVI S6, 0
SMOVI S7, 100
SNOP
SBEQ S6, S7, 54
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
Q2SCHCKE S8, Q24
SNOP
SNOP
SNOP
SNOP
SBGT S8, S0, 41
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 0
QLOAD Q8, Q5, 4194304
QLOAD Q9, Q6, 12582912
QSQMOV Q26, Q4
QSQMOV Q27, Q7
QSQMOV Q28, Q8
QSQMOV Q29, Q9
GRUN
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
WAITQ Q30
QGENID_S Q1, S2, S3, 1
QFORK Q2, Q3, Q1
QFORK Q4, Q5, Q2
QLOAD Q6, Q7, Q3, 8388608
QLOAD Q8, Q4, 12582912
QSLT Q9, Q6, Q8
QFORK Q10, Q11, Q9
QFILTER Q12, Q5, Q10
QFORK Q24, Q13, Q12
QFILTER Q14, Q7, Q11
QSTORE Q13, Q14, 12582912
WAITQ Q13
SADDI S6, S6, 1
SNOP
SJAL S9, -55
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SMOVI S14, 20971520
SMOVI S15, 12582912
SDMAV2L S14, S15, S1, 0
SDMABARRIER
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
`,
      'sssp': '// 这里应该是SSSP的硬件指令代码',
      'wcc': '// 这里应该是WCC的硬件指令代码',
      'kcore': '// 这里应该是K-Core的硬件指令代码',
      'kclique': '// 这里应该是K-Clique的硬件指令代码',
      'ppr': '// 这里应该是PPR的硬件指令代码',
      'gcn': '// 这里应该是GCN的硬件指令代码'
    },
    'existing-framework': {
      'graphscope': {
        'bfs': '// 这里应该是GraphScope的BFS代码',
        'sssp': '// 这里应该是GraphScope的SSSP代码',
        'wcc': '// 这里应该是GraphScope的WCC代码',
        'kcore': '// 这里应该是GraphScope的K-Core代码',
        'kclique': '// 这里应该是GraphScope的K-Clique代码',
        'ppr': '// 这里应该是GraphScope的PPR代码'
      },
      'dgl': {
        'gcn': '// 这里应该是DGL的GCN代码',
        'ppr': '// 这里应该是DGL的PPR代码'
      }
    }
  };