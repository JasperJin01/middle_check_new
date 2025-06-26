// 代码数据
export const codeData = {
    'device-cga': {
      'bfs': `# 这里是BFS的CGA代码
from graph_dsl import *

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


      'sssp': `# 这里是SSSP的CGA代码
from graph_dsl import * 

class SSSPKernel(GraphTraversalKernel):
  def __init__(self, 
               dev_graph:Graph, 
               dev_dis:vec_int, 
               dev_root:int):
    super().__init__(dev_graph, CHANGED_MODE, 
                     PUSH, CUSTOMED_EDGE_PROP)
    
    self.root : int = dev_root
    self.dis : vec_int = dev_dis

    self.CGAprop:GraphTraversalProPerty=()
    self.CGAprop.res = ()
    self.CGAprop.frontier = FrontierFromRoot(self.root)
    self.CGAprop.end_tag  = self.CGAprop.frontier.isempty()
    self.CGAprop.maxiter = 10000
    self.CGAprop.ret_value = self.dis
  
  def gather_mult(msg, weight):
    return msg + weight
  
  def gather_add(res1, res2):
    return min(res1, res2)
  
  def construct(self):
    return self.dis

  def apply(self):
    self.dis = min(self.dis, self.CGAprop.res)
    return self.dis`,

    
      'wcc': `# 这里是WCC的CGA代码
from graph_dsl import * 

class WCCKernel(GraphTraversalKernel):
  def __init__(self, 
               dev_graph:Graph, 
               dev_prop:vec_int):
    super().__init__(dev_graph, CHANGED_MODE, 
                     PUSH, DEFAULT_EDGE_PROP)
    self.prop : vec_int = dev_prop

    self.CGAprop:GraphTraversalProPerty=()
    self.CGAprop.res = ()
    self.CGAprop.frontier = FrontierFull()
    self.CGAprop.end_tag  = self.CGAprop.frontier.isempty()
    self.CGAprop.maxiter = 10000   
    self.CGAprop.ret_value = self.prop
  
  def gather_mult(msg, weight):
    return msg 
  
  def gather_add(res1, res2):
    return min(res1, res2)
  
  def construct(self):
    return self.prop

  def apply(self):
    self.prop = min(self.prop, self.CGAprop.res)
    return self.prop`,


      'kcore': `# 这里是K-Core的CGA代码
from graph_dsl import *

class KcoreKernel(GraphTraversalKernel):
  def __init__(self, 
               dev_graph: Graph, 
               dev_prop: vec_int, 
               dev_degree: vec_int, 
               dev_nodemask: vec_int):
    super().__init__(dev_graph, CUSTOMED_MODE, PUSH, DEFAULT_EDGE_PROP)
    self.degree : vec_int = dev_degree
    self.nodemask : vec_int =dev_nodemask
    
    self.K : int = 10

    self.CGAprop:GraphTraversalProPerty=()
    self.CGAprop.res = ()
    self.CGAprop.frontier = ()
    self.CGAprop.end_tag = self.CGAprop.frontier.isempty()
    self.CGAprop.maxiter = 30
    self.CGAprop.ret_value = (self.nodemask, self.degree)

  def gather_mult(msg, weight):
    return msg + 1

  def gather_add(res1, res2):
    return res1 + res2

  def construct(self):
    node_ltk = self.degree < self.K
    node_ltk1 = node_ltk & self.nodemask
    self.nodemask = self.nodemask ^ node_ltk1
    self.CGAprop.frontier = FrontierFromQueue(node_ltk1)
    return 0

  def apply(self):
    self.degree = self.degree - self.CGAprop.res
    return self.degree`,

    
      'kclique': `# 这里是K-Clique的CGA代码
from graph_dsl import *

class KCliqueKernel(GraphMiningKernel):
  def __init__(self, 
               dev_graph : Graph, 
               dev_prop : vec_float, 
               dev_cnt :int):                  
    super().__init__(dev_graph, FULL_MODE, 
                     PULL, DEFAULT_EDGE_PROP)
    self.prop : vec_int = dev_prop
    self.cf_cnt : int = dev_cnt

    self.CGAprop : GraphPatternMiningProPerty = ()
    self.CGAprop.res = ()
    self.CGAprop.ret_value = self.cf_cnt
    self.CGAprop.CfNum = 3

  def gather_mult(msg, weight):
    return msg 

  def gather_add(res1, res2):
    return res1 + res2

  def construct(self):
    return self.prop

  def apply(self):
    self.cf_cnt = self.CGAprop.res`,


      'ppr': `# 这里是PPR的CGA代码
from graph_dsl import *

class PPRKernel(GraphTraversalKernel):
  def __init__(self, 
               dev_graph:Graph, 
               dev_pr:vec_float, 
               dev_addconst:vec_float):
    super().__init__(dev_graph, FULL_MODE, PUSH, DEFAULT_EDGE_PROP)
    self.pr : vec_float = dev_pr
    self.addconst : vec_float = dev_addconst

    self.Alpha : float = 0.85
    self.Epsilon : float = 1e-6

    self.CGAprop:GraphTraversalProPerty=()
    self.CGAprop.res = ()
    self.CGAprop.end_tag  = ()
    self.CGAprop.maxiter = 10
    self.CGAprop.ret_value = self.pr
      
  def gather_mult(msg, weight):
    return msg 
  
  def gather_add(res1, res2):
    return res1 + res2
  
  def construct(self):
    outdegree  = self.graph.Get_Degree()
    msg : vec_float = (self.pr* self.Alpha)/ outdegree
    return msg

  def apply(self):
    pr_new : vec_float = self.CGAprop.res + self.addconst
    self.pr = pr_new 
    return self.pr`,


      'gcn': `# 这里是GCN的CGA代码
from graph_dsl import *

class GCNKernel(GraphLearningKernel):
  def __init__(self,
               dev_graph: Graph,
               dev_FM: matrix_float,
               dev_WM_1: matrix_float,
               dev_WM_2: matrix_float):
    super().__init__(dev_graph, FULL_MODE, 
                     PUSH, CUSTOMED_EDGE_PROP)
    self.Fmat: matrix_float = dev_FM
    self.Wmat1: matrix_float = dev_WM_1
    self.Wmat2: matrix_float = dev_WM_2
  
    self.CGAprop: GraphLearningProPerty = ()
    self.CGAprop.res = ()
    self.CGAprop.layer = ()
    self.CGAprop.layer_num = 2

  def gather_mult(msg, weight):
    return msg * weight

  def gather_add(res1, res2):
    return res1 + res2

  def construct(self):
    return self.CGAprop.layer

  def apply(self):
    self.CGAprop.G_Relu(self.CGAprop.res)

  def compute(self):
    Gcn_Layer(self.Wmat1, self.Fmat, self.construct, 
              self.gather_add, self.gather_mult, self.apply)
    Gcn_Layer(self.Wmat2, self.Fmat, self.construct, 
              self.gather_add, self.gather_mult)
      `,


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


      'framework': '// 这里是框架转换生成的代码'
    },
    'host-code': {
      'default': `// Input: Graph G, number of iterations iter
// Output: Final result after iter iterations 
// or when the computation finishes early

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
      'bfs': `// 这是BFS的GraphIR代码
module {
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
}`,
      'sssp': `// 这是SSSP的GraphIR代码
module {
  func.func @GraphTraversalKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 1 : i32, data_name = "self.root", data_tag = "scalar"}> : () -> i32
    %2 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.dis", data_tag = "vector"}> : () -> tensor<*xi32>
    graph.data_label_end
    %3 = "graph.LoadFromSpm"(%1) <{spm_loc = "self.root"}> : (i32) -> i32
    "graph.FrontierFromRoot"(%3) : (i32) -> ()
    %c10000_i32 = arith.constant 10000 : i32
    %c0_i32 = arith.constant 0 : i32
    %c1_i32 = arith.constant 1 : i32
    scf.for %arg0 = %c0_i32 to %c10000_i32 step %c1_i32  : i32 {
      "graph.GrunEndTag"() <{EndTag = "frontier_empty"}> : () -> ()
      %4 = "graph.kernel_gc"(%2) <{active_mode = "CHANGED_MODE", direction_mode = "PUSH", edge_value = "CUSTOMED_EDGE_PROP", gather_add_mode = "Min_", gather_mult_mode = "Add_Weight_"}> : (tensor<*xi32>) -> tensor<*xi32>
      %5 = "graph.LoadFromSpm"(%2) <{spm_loc = "self.dis"}> : (tensor<*xi32>) -> tensor<*xi32>
      %6 = "graph.min"(%5, %4) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
      "graph.StoreToSpm"(%6) <{spm_loc = "self.dis"}> : (tensor<*xi32>) -> ()
      "graph.FrontierFromPropChanged"(%6) : (tensor<*xi32>) -> ()
    }
    graph.return %2 : tensor<*xi32>
    return
  }
}`,
      'wcc': `// 这是WCC的GraphIR代码
module {
  func.func @GraphTraversalKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.prop", data_tag = "vector"}> : () -> tensor<*xi32>
    graph.data_label_end
    "graph.FrontierFull"() : () -> ()
    %c10000_i32 = arith.constant 10000 : i32
    %c0_i32 = arith.constant 0 : i32
    %c1_i32 = arith.constant 1 : i32
    scf.for %arg0 = %c0_i32 to %c10000_i32 step %c1_i32  : i32 {
      "graph.GrunEndTag"() <{EndTag = "frontier_empty"}> : () -> ()
      %2 = "graph.kernel_gc"(%1) <{active_mode = "CHANGED_MODE", direction_mode = "PUSH", edge_value = "DEFAULT_EDGE_PROP", gather_add_mode = "Min_", gather_mult_mode = "First_"}> : (tensor<*xi32>) -> tensor<*xi32>
      %3 = "graph.LoadFromSpm"(%1) <{spm_loc = "self.prop"}> : (tensor<*xi32>) -> tensor<*xi32>
      %4 = "graph.min"(%3, %2) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
      "graph.StoreToSpm"(%4) <{spm_loc = "self.prop"}> : (tensor<*xi32>) -> ()
      "graph.FrontierFromPropChanged"(%4) : (tensor<*xi32>) -> ()
    }
    graph.return %1 : tensor<*xi32>
    return
  }
}`,
      'kcore': `// 这是K-Core的GraphIR代码
module {
  func.func @GraphTraversalKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.degree", data_tag = "vector"}> : () -> tensor<*xi32>
    %2 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.nodemask", data_tag = "vector"}> : () -> tensor<*xi32>
    %c10_i32 = arith.constant 10 : i32
    graph.data_label_end
    %c30_i32 = arith.constant 30 : i32
    %c0_i32 = arith.constant 0 : i32
    %c1_i32 = arith.constant 1 : i32
    scf.for %arg0 = %c0_i32 to %c30_i32 step %c1_i32  : i32 {
      %3 = "graph.LoadFromSpm"(%1) <{spm_loc = "self.degree"}> : (tensor<*xi32>) -> tensor<*xi32>
      %4 = "graph.lt"(%3, %c10_i32) : (tensor<*xi32>, i32) -> tensor<*xi32>
      %5 = "graph.LoadFromSpm"(%2) <{spm_loc = "self.nodemask"}> : (tensor<*xi32>) -> tensor<*xi32>
      %6 = "graph.AND"(%4, %5) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
      %7 = "graph.XOR"(%5, %6) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
      "graph.StoreToSpm"(%7) <{spm_loc = "self.nodemask"}> : (tensor<*xi32>) -> ()
      "graph.FrontierFromQueue"(%6) : (tensor<*xi32>) -> ()
      %8 = graph.MSG_ZERO : tensor<*xi32>
      %9 = "graph.kernel_gc"(%8) <{active_mode = "CUSTOMED_MODE", direction_mode = "PUSH", edge_value = "DEFAULT_EDGE_PROP", gather_add_mode = "Add_", gather_mult_mode = "Add_One_"}> : (tensor<*xi32>) -> tensor<*xi32>
      %10 = "graph.LoadFromSpm"(%3) <{spm_loc = "self.degree"}> : (tensor<*xi32>) -> tensor<*xi32>
      %11 = "graph.sub"(%10, %9) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
      "graph.StoreToSpm"(%11) <{spm_loc = "self.degree"}> : (tensor<*xi32>) -> ()
      graph.RESET_RES
    }
    graph.return %2, %1 : tensor<*xi32>, tensor<*xi32>
    return
  }
}`,
      'kclique': `// 这是K-Clique的GraphIR代码
module {
  func.func @GraphMiningKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.prop", data_tag = "vector"}> : () -> tensor<*xi32>
    %2 = "graph.data_label"() <{data_len = 1 : i32, data_name = "self.cf_cnt", data_tag = "scalar"}> : () -> i32
    graph.data_label_end
    %3 = "graph.kernel_gpm"(%1) <{active_mode = "FULL_MODE", cfnum = 3 : i32, direction_mode = "PULL", edge_value = "DEFAULT_EDGE_PROP", gather_add_mode = "Add_", gather_mult_mode = "First_"}> : (tensor<*xi32>) -> i32
    %4 = "graph.copy"(%3) : (i32) -> i32
    "graph.StoreToSpm"(%4) <{spm_loc = "self.cf_cnt"}> : (i32) -> ()
    graph.return %2 : i32
    return
  }
}
`,
      'ppr': `// 这是PPR的GraphIR代码
module {
  func.func @GraphTraversalKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.pr", data_tag = "vector"}> : () -> tensor<*xf32>
    %2 = "graph.data_label"() <{data_len = 1048576 : i32, data_name = "self.addconst", data_tag = "vector"}> : () -> tensor<*xf32>
    %cst = arith.constant 8.500000e-01 : f32
    %cst_0 = arith.constant 9.99999997E-7 : f32
    graph.data_label_end
    %c10_i32 = arith.constant 10 : i32
    %c0_i32 = arith.constant 0 : i32
    %c1_i32 = arith.constant 1 : i32
    scf.for %arg0 = %c0_i32 to %c10_i32 step %c1_i32  : i32 {
      %3 = "graph.getDegree"() : () -> tensor<*xi32>
      %4 = "graph.LoadFromSpm"(%1) <{spm_loc = "self.pr"}> : (tensor<*xf32>) -> tensor<*xf32>
      %5 = "graph.mul"(%4, %cst) : (tensor<*xf32>, f32) -> tensor<*xf32>
      %6 = "graph.div"(%5, %3) : (tensor<*xf32>, tensor<*xi32>) -> tensor<*xf32>
      %7 = "graph.kernel_gc"(%6) <{active_mode = "FULL_MODE", direction_mode = "PUSH", edge_value = "DEFAULT_EDGE_PROP", gather_add_mode = "Addf_", gather_mult_mode = "First_"}> : (tensor<*xf32>) -> tensor<*xf32>
      %8 = "graph.LoadFromSpm"(%2) <{spm_loc = "self.addconst"}> : (tensor<*xf32>) -> tensor<*xf32>
      %9 = "graph.add"(%7, %8) : (tensor<*xf32>, tensor<*xf32>) -> tensor<*xf32>
      %10 = "graph.copy"(%9) : (tensor<*xf32>) -> tensor<*xf32>
      "graph.StoreToSpm"(%10) <{spm_loc = "self.pr"}> : (tensor<*xf32>) -> ()
      graph.RESET_RES
    }
    graph.return %1 : tensor<*xf32>
    return
  }
}`,
      'gcn': `// 这是GCN的GraphIR代码
module {
  func.func @GraphLearningKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.Fmat", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    %2 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.Wmat1", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    %3 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.Wmat2", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    graph.data_label_end
    %4 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.CGAprop.layer", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    %5 = "graph.GCNLayer"(%0, %1, %2) <{active_mode = "FULL_MODE", direction_mode = "PUSH", edge_value = "CUSTOMED_EDGE_PROP", gather_add_mode = "Add_", gather_mult_mode = "Mul_Weight_"}> : (tensor<*xi32>, tensor<?x?xf32>, tensor<?x?xf32>) -> tensor<?x?xf32>
    %6 = "graph.GRelu"(%5) : (tensor<?x?xf32>) -> tensor<?x?xf32>
    %7 = "graph.GCNLayer"(%0, %6, %3) <{active_mode = "FULL_MODE", direction_mode = "PUSH", edge_value = "CUSTOMED_EDGE_PROP", gather_add_mode = "Add_", gather_mult_mode = "Mul_Weight_"}> : (tensor<*xi32>, tensor<?x?xf32>, tensor<?x?xf32>) -> tensor<?x?xf32>
    graph.return %7 : tensor<?x?xf32>
    return
  }
}`,
      'custom': `图遍历算法为统一编程框架CGA实现
经过编译器前端修改生成GraphIR代码`,
      'framework': `// 这里是框架转换生成的代码`
    },
    'matrix-ir': {
      'bfs': `// 这是BFS的MatrixIR代码
module {
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
}`,
      'sssp': `// 这是SSSP的MatrixIR代码
module {
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
    %7 = "matrix.SDMAL2V"(%3) <{data_name = "self.dis", data_tag = "vector"}> : (i32) -> tensor<*xi32>
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
    "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode MIN>, edge_fifo = #matrix<edge_fifo_mode ON>, mul_alu = #matrix<mul_alu_mode ADDE>, traversal_dirc = #matrix<tr_dirc_mode PUSH>}> : () -> ()
    %15 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Scf.for args2"}> : () -> i32
    %16 = "matrix.SMOVI"() <{assignvalue = 10000 : i32, mode = "IMM", name = "Scf.for args3"}> : () -> i32
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
    %24 = "matrix.QLOAD"(%21#1) <{spm_loc = "self.dis"}> : (tensor<*xi32>) -> tensor<*xi32>
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
    %29 = "matrix.QLOAD"(%27#0) <{spm_loc = "self.dis"}> : (tensor<*xi32>) -> tensor<*xi32>
    %30 = "matrix.QSLT"(%28#0, %29) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %31:2 = "matrix.QFORK"(%30) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %32 = "matrix.QFILTER"(%27#1, %31#0) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %33 = "matrix.QFORKTS"(%32) <{special_queue = "Active_Queue_24"}> : (tensor<*xi32>) -> tensor<*xi32>
    %34 = "matrix.QFILTER"(%28#1, %31#1) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSTORE"(%33, %34) <{spm_loc = "self.dis"}> : (tensor<*xi32>, tensor<*xi32>) -> ()
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
    "matrix.SDMAV2L"(%3) <{data_name = "self.dis", data_tag = "vector"}> : (i32) -> ()
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
}`,
      'wcc': `// 这是WCC的MatrixIR代码
module {
  func.func @GraphTraversalKernel() {
    %0 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum", data_tag = "Input"}> : () -> i32
    %1 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum_Aligned", data_tag = "Input"}> : () -> i32
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %2 = "matrix.SLOAD"() <{spm_loc = "VertexNum_Aligned"}> : () -> i32
    %3 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ST", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %4 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ED", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %5 = "matrix.SDMAL2V"(%2) <{data_name = "NEW_V", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %6 = "matrix.SDMAL2V"(%2) <{data_name = "self.prop", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %7 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Zero"}> : () -> i32
    %8 = "matrix.SLOAD"() <{spm_loc = "VertexNum"}> : () -> i32
    %9 = "matrix.QFULLMASK"(%7, %8) <{to_special_queue = "Special_Queue"}> : (i32, i32) -> tensor<*xi32>
    %10 = matrix.QUEUEZERO : tensor<*xi32>
    graph.data_label_end
    %11 = "matrix.QGENIDIS"(%7, %8) <{to_special_queue = "Active_Queue_24"}> : (i32, i32) -> tensor<*xi32>
    "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode MIN>, edge_fifo = #matrix<edge_fifo_mode OFF>, mul_alu = #matrix<mul_alu_mode NONE>, traversal_dirc = #matrix<tr_dirc_mode PUSH>}> : () -> ()
    %12 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Scf.for args2"}> : () -> i32
    %13 = "matrix.SMOVI"() <{assignvalue = 10000 : i32, mode = "IMM", name = "Scf.for args3"}> : () -> i32
    matrix.op_label {str = "Entry_1"}
    matrix.SBEQ %12 : i32, %13 : i32 {label = "Exit_1"}
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %14 = "matrix.Q2SCHCKE"() <{special_queue = "Active_Queue_24"}> {name = "VertexNum"} : () -> i32
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %15 = "matrix.SBGT"(%14) <{cmp_val = 0 : i32, label = "Exit_1"}> : (i32) -> i32
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %16:2 = "matrix.QFORKFS"() <{special_queue = "Active_Queue_24"}> : () -> (tensor<*xi32>, tensor<*xi32>)
    %17:2 = "matrix.QFORK"(%16#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %18:2 = "matrix.QFORK"(%16#1) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %19 = "matrix.QLOAD"(%17#0) <{spm_loc = "OFF_ST"}> : (tensor<*xi32>) -> tensor<*xi32>
    %20 = "matrix.QLOAD"(%18#0) <{spm_loc = "OFF_ED"}> : (tensor<*xi32>) -> tensor<*xi32>
    %21 = "matrix.QLOAD"(%18#1) <{spm_loc = "self.prop"}> : (tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSQMOV"(%17#1) <{graph_queue_id = 26 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%19) <{graph_queue_id = 27 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%20) <{graph_queue_id = 28 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%21) <{graph_queue_id = 29 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.GRUN"() <{OutputSpm = "NEW_V"}> : () -> ()
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    "matrix.WAITSQ"() <{wait_queue = "Graph_Queue_id"}> : () -> ()
    %22 = "matrix.QGENIDI"(%7, %8) : (i32, i32) -> tensor<*xi32>
    %23:2 = "matrix.QFORK"(%22) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %24:2 = "matrix.QFORK"(%23#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %25:2 = "matrix.QLOAD"(%23#1) <{spm_loc = "NEW_V"}> : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %26 = "matrix.QLOAD"(%24#0) <{spm_loc = "self.prop"}> : (tensor<*xi32>) -> tensor<*xi32>
    %27 = "matrix.QSLT"(%25#0, %26) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %28:2 = "matrix.QFORK"(%27) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %29 = "matrix.QFILTER"(%24#1, %28#0) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %30 = "matrix.QFORKTS"(%29) <{special_queue = "Active_Queue_24"}> : (tensor<*xi32>) -> tensor<*xi32>
    %31 = "matrix.QFILTER"(%25#1, %28#1) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSTORE"(%30, %31) <{spm_loc = "self.prop"}> : (tensor<*xi32>, tensor<*xi32>) -> ()
    "matrix.WAITQ"(%30) : (tensor<*xi32>) -> ()
    "matrix.AUG_ADDI"(%12) <{constscalar = 1 : i32}> : (i32) -> ()
    matrix.SNOP
    %32 = matrix.SJAL {str = "Entry_1"} : i32
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
    "matrix.SDMAV2L"(%2) <{data_name = "self.prop", data_tag = "vector"}> : (i32) -> ()
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
}`,
      'kcore': `// 这是K-Core的MatrixIR代码
module {
  func.func @GraphTraversalKernel() {
    %0 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum", data_tag = "Input"}> : () -> i32
    %1 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum_Aligned", data_tag = "Input"}> : () -> i32
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %2 = "matrix.SLOAD"() <{spm_loc = "VertexNum_Aligned"}> : () -> i32
    %3 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ST", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %4 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ED", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %5 = "matrix.SDMAL2V"(%2) <{data_name = "NEW_V", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %6 = "matrix.SDMAL2V"(%2) <{data_name = "self.degree", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %7 = "matrix.SDMAL2V"(%2) <{data_name = "self.nodemask", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %8 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Zero"}> : () -> i32
    %9 = "matrix.SLOAD"() <{spm_loc = "VertexNum"}> : () -> i32
    %10 = "matrix.QFULLMASK"(%8, %9) <{to_special_queue = "Special_Queue"}> : (i32, i32) -> tensor<*xi32>
    %11 = matrix.QUEUEZERO : tensor<*xi32>
    graph.data_label_end
    "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode IPLUS>, edge_fifo = #matrix<edge_fifo_mode OFF>, mul_alu = #matrix<mul_alu_mode PLUS1>, traversal_dirc = #matrix<tr_dirc_mode PUSH>}> : () -> ()
    %12 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Scf.for args2"}> : () -> i32
    %13 = "matrix.SMOVI"() <{assignvalue = 30 : i32, mode = "IMM", name = "Scf.for args3"}> : () -> i32
    matrix.op_label {str = "Entry_1"}
    matrix.SBEQ %12 : i32, %13 : i32 {label = "Exit_1"}
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %14 = "matrix.QGENIDISRA"(%8, %9) <{to_special_queue = "Active_Queue_24"}> : (i32, i32) -> tensor<*xi32>
    %15:2 = "matrix.QFORK"(%14) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %16:2 = "matrix.QFORK"(%15#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %17:2 = "matrix.QFORK"(%15#1) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %18 = "matrix.QLOAD"(%16#0) <{spm_loc = "self.degree"}> : (tensor<*xi32>) -> tensor<*xi32>
    %19 = "matrix.QSLTI"(%18) <{constscalar = 10 : i32}> : (tensor<*xi32>) -> tensor<*xi32>
    %20:2 = "matrix.QLOAD"(%16#1) <{spm_loc = "self.nodemask"}> : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %21:2 = "matrix.QAND"(%19, %20#0) : (tensor<*xi32>, tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %22 = "matrix.QXOR"(%20#1, %21#0) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSTORE"(%17#0, %22) <{spm_loc = "self.nodemask"}> : (tensor<*xi32>, tensor<*xi32>) -> ()
    %23 = "matrix.QFILTER"(%17#1, %21#1) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %24:2 = "matrix.QFORK"(%23) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %25:2 = "matrix.QFORK"(%24#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %26:2 = "matrix.QFORK"(%24#1) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %27 = "matrix.QSLTI"(%25#0) <{constscalar = 0 : i32}> : (tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSQMOV"(%27) <{graph_queue_id = 29 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    %28 = "matrix.QLOAD"(%25#1) <{spm_loc = "OFF_ST"}> : (tensor<*xi32>) -> tensor<*xi32>
    %29 = "matrix.QLOAD"(%26#0) <{spm_loc = "OFF_ED"}> : (tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSQMOV"(%26#1) <{graph_queue_id = 26 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%28) <{graph_queue_id = 27 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%29) <{graph_queue_id = 28 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.GRUN"() <{OutputSpm = "NEW_V"}> : () -> ()
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    "matrix.WAITSQ"() <{wait_queue = "Graph_Queue_id"}> : () -> ()
    %30 = "matrix.QGENIDISRA"(%8, %9) <{to_special_queue = "Active_Queue_24"}> : (i32, i32) -> tensor<*xi32>
    %31:2 = "matrix.QFORK"(%30) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %32:2 = "matrix.QFORK"(%31#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %33:2 = "matrix.QFORK"(%31#1) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %34 = "matrix.QLOAD"(%32#0) <{spm_loc = "NEW_V"}> : (tensor<*xi32>) -> tensor<*xi32>
    %35 = "matrix.QLOAD"(%32#1) <{spm_loc = "self.degree"}> : (tensor<*xi32>) -> tensor<*xi32>
    %36 = "matrix.QSUB"(%35, %34) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSTORE"(%33#0, %36) <{spm_loc = "self.degree"}> : (tensor<*xi32>, tensor<*xi32>) -> ()
    "matrix.QSTORE"(%33#1, %11) <{spm_loc = "NEW_V"}> : (tensor<*xi32>, tensor<*xi32>) -> ()
    "matrix.WAITQ"(%33#1) : (tensor<*xi32>) -> ()
    "matrix.AUG_ADDI"(%12) <{constscalar = 1 : i32}> : (i32) -> ()
    matrix.SNOP
    %37 = matrix.SJAL {str = "Entry_1"} : i32
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
    "matrix.SDMAV2L"(%2) <{data_name = "self.nodemask", data_tag = "vector"}> : (i32) -> ()
    "matrix.SDMAV2L"(%2) <{data_name = "self.degree", data_tag = "vector"}> : (i32) -> ()
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
}`,
      'kclique': `// 这是K-Clique的MatrixIR代码
module {
  "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode IPLUS>, edge_fifo = #matrix<edge_fifo_mode OFF>, mul_alu = #matrix<mul_alu_mode NONE>, traversal_dirc = #matrix<tr_dirc_mode PULL>}> : () -> ()
  func.func @GraphMiningKernel() {
    %0 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum", data_tag = "Input"}> : () -> i32
    %1 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum_Aligned", data_tag = "Input"}> : () -> i32
    %2 = "matrix.SLOAD"() <{spm_loc = "VertexNum_Aligned"}> : () -> i32
    %3 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ST", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %4 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ED", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %5 = "matrix.SDMAL2V"(%2) <{data_name = "NEW_V", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %6 = "matrix.SDMAL2V"(%2) <{data_name = "self.prop", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %7 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "self.cf_cnt", data_tag = "scalar"}> : () -> i32
    %8 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Zero"}> : () -> i32
    %9 = "matrix.SLOAD"() <{spm_loc = "VertexNum"}> : () -> i32
    %10 = "matrix.QFULLMASK"(%8, %9) <{to_special_queue = "Special_Queue"}> : (i32, i32) -> tensor<*xi32>
    %11 = matrix.QUEUEZERO : tensor<*xi32>
    graph.data_label_end
    "matrix.QSQMOV"(%6) <{graph_queue_id = 29 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    %12:2 = "matrix.QFORKFS"() <{special_queue = "Active_Queue_24"}> : () -> (tensor<*xi32>, tensor<*xi32>)
    %13:2 = "matrix.QFORK"(%12#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %14 = "matrix.QLOAD"(%12#1) <{spm_loc = "OFF_ST"}> : (tensor<*xi32>) -> tensor<*xi32>
    %15 = "matrix.QLOAD"(%13#0) <{spm_loc = "OFF_ED"}> : (tensor<*xi32>) -> tensor<*xi32>
    "matrix.QSQMOV"(%13#1) <{graph_queue_id = 26 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%14) <{graph_queue_id = 27 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%15) <{graph_queue_id = 28 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.GRUN"() <{OutputSpm = "NEW_V"}> : () -> ()
    "matrix.WAITSQ"() <{wait_queue = "Graph_Queue_id"}> : () -> ()
    %16 = "matrix.SLOAD"() <{spm_loc = "NEW_V"}> : () -> i32
    %17 = "graph.copy"(%16) : (i32) -> i32
    "graph.StoreToSpm"(%17) <{spm_loc = "self.cf_cnt"}> : (i32) -> ()
    graph.return %7 : i32
    return
  }
}
`,
      'ppr': `// 这是PPR的MatrixIR代码
module {
  func.func @GraphTraversalKernel() {
    %0 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum", data_tag = "Input"}> : () -> i32
    %1 = "matrix.SDMAL2S"() <{data_len = 4 : i32, data_name = "VertexNum_Aligned", data_tag = "Input"}> : () -> i32
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %2 = "matrix.SLOAD"() <{spm_loc = "VertexNum_Aligned"}> : () -> i32
    %3 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ST", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %4 = "matrix.SDMAL2V"(%2) <{data_name = "OFF_ED", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %5 = "matrix.SDMAL2V"(%2) <{data_name = "NEW_V", data_tag = "vector"}> : (i32) -> tensor<*xi32>
    %6 = "matrix.SDMAL2V"(%2) <{data_name = "self.pr", data_tag = "vector"}> : (i32) -> tensor<*xf32>
    %7 = "matrix.SDMAL2V"(%2) <{data_name = "self.addconst", data_tag = "vector"}> : (i32) -> tensor<*xf32>
    matrix.SDMABARRIER
    matrix.SNOP
    matrix.SNOP
    %8 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Zero"}> : () -> i32
    %9 = "matrix.SLOAD"() <{spm_loc = "VertexNum"}> : () -> i32
    %10 = "matrix.QFULLMASK"(%8, %9) <{to_special_queue = "Special_Queue"}> : (i32, i32) -> tensor<*xi32>
    %11 = matrix.QUEUEZERO : tensor<*xi32>
    graph.data_label_end
    "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode FPLUS>, edge_fifo = #matrix<edge_fifo_mode OFF>, mul_alu = #matrix<mul_alu_mode NONE>, traversal_dirc = #matrix<tr_dirc_mode PUSH>}> : () -> ()
    %12 = "matrix.SMOVI"() <{assignvalue = 0 : i32, mode = "IMM", name = "Scf.for args2"}> : () -> i32
    %13 = "matrix.SMOVI"() <{assignvalue = 10 : i32, mode = "IMM", name = "Scf.for args3"}> : () -> i32
    matrix.op_label {str = "Entry_1"}
    matrix.SBEQ %12 : i32, %13 : i32 {label = "Exit_1"}
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    %14 = "matrix.QGENIDISRA"(%8, %9) <{to_special_queue = "Active_Queue_24"}> : (i32, i32) -> tensor<*xi32>
    %15:2 = "matrix.QFORK"(%14) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %16:2 = "matrix.QFORK"(%15#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %17:2 = "matrix.QFORK"(%15#1) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %18:2 = "matrix.QLOAD"(%16#0) <{spm_loc = "OFF_ST"}> : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %19:2 = "matrix.QLOAD"(%16#1) <{spm_loc = "OFF_ED"}> : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %20:2 = "matrix.QSUB"(%19#0, %18#0) : (tensor<*xi32>, tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %21 = "matrix.QSLT"(%11, %20#0) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %22 = "matrix.QSUBI"(%21) <{constscalar = 1 : i32}> : (tensor<*xi32>) -> tensor<*xi32>
    %23 = "matrix.QSLT"(%22, %11) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %24 = "matrix.QADD"(%20#1, %23) : (tensor<*xi32>, tensor<*xi32>) -> tensor<*xi32>
    %25 = "matrix.QI2F"(%24) : (tensor<*xi32>) -> tensor<*xf32>
    %26 = "matrix.QLOAD"(%17#0) <{spm_loc = "self.pr"}> : (tensor<*xi32>) -> tensor<*xf32>
    %27 = "matrix.QFMULI"(%26) <{constscalar = 8.500000e-01 : f32}> : (tensor<*xf32>) -> tensor<*xf32>
    %28 = "matrix.QFDIV"(%27, %25) : (tensor<*xf32>, tensor<*xf32>) -> tensor<*xf32>
    "matrix.QSQMOV"(%28) <{graph_queue_id = 29 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xf32>) -> ()
    "matrix.QSQMOV"(%17#1) <{graph_queue_id = 26 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%18#1) <{graph_queue_id = 27 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.QSQMOV"(%19#1) <{graph_queue_id = 28 : i32, queue_mode = #matrix<queue_mode GRAPH>}> : (tensor<*xi32>) -> ()
    "matrix.GRUN"() <{OutputSpm = "NEW_V"}> : () -> ()
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    matrix.SNOP
    "matrix.WAITSQ"() <{wait_queue = "Graph_Queue_id"}> : () -> ()
    %29 = "matrix.QGENIDISRA"(%8, %9) <{to_special_queue = "Active_Queue_24"}> : (i32, i32) -> tensor<*xi32>
    %30:2 = "matrix.QFORK"(%29) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %31:2 = "matrix.QFORK"(%30#0) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %32:2 = "matrix.QFORK"(%30#1) : (tensor<*xi32>) -> (tensor<*xi32>, tensor<*xi32>)
    %33 = "matrix.QLOAD"(%31#0) <{spm_loc = "NEW_V"}> : (tensor<*xi32>) -> tensor<*xf32>
    %34 = "matrix.QLOAD"(%31#1) <{spm_loc = "self.addconst"}> : (tensor<*xi32>) -> tensor<*xf32>
    %35 = "matrix.QFADD"(%33, %34) : (tensor<*xf32>, tensor<*xf32>) -> tensor<*xf32>
    "matrix.QSTORE"(%32#0, %35) <{spm_loc = "self.pr"}> : (tensor<*xi32>, tensor<*xf32>) -> ()
    "matrix.QSTORE"(%32#1, %11) <{spm_loc = "NEW_V"}> : (tensor<*xi32>, tensor<*xi32>) -> ()
    "matrix.WAITQ"(%32#1) : (tensor<*xi32>) -> ()
    "matrix.AUG_ADDI"(%12) <{constscalar = 1 : i32}> : (i32) -> ()
    matrix.SNOP
    %36 = matrix.SJAL {str = "Entry_1"} : i32
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
    "matrix.SDMAV2L"(%2) <{data_name = "self.pr", data_tag = "vector"}> : (i32) -> ()
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
}`,
      'gcn': `// 这是GCN的MatrixIR代码
module {
  func.func @GraphLearningKernel() {
    %0 = "graph.graph_label"() <{data_name = "input_graph", data_tag = "Graph"}> : () -> tensor<*xi32>
    %1 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.Fmat", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    %2 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.Wmat1", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    %3 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.Wmat2", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    graph.data_label_end
    %4 = "graph.data_label"() <{data_len = 104857600 : i32, data_name = "self.CGAprop.layer", data_tag = "matrix"}> : () -> tensor<?x?xf32>
    "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode IPLUS>, edge_fifo = #matrix<edge_fifo_mode ON>, mul_alu = #matrix<mul_alu_mode MULE>, traversal_dirc = #matrix<tr_dirc_mode PUSH>}> : () -> ()
    %5 = "matrix.SDDMM"(%1, %2) : (tensor<?x?xf32>, tensor<?x?xf32>) -> tensor<?x?xf32>
    %6 = "matrix.SpMM"(%0, %5) : (tensor<*xi32>, tensor<?x?xf32>) -> tensor<?x?xf32>
    %7 = "graph.GRelu"(%6) : (tensor<?x?xf32>) -> tensor<?x?xf32>
    "matrix.GCONFIG"() <{add_alu = #matrix<add_alu_mode IPLUS>, edge_fifo = #matrix<edge_fifo_mode ON>, mul_alu = #matrix<mul_alu_mode MULE>, traversal_dirc = #matrix<tr_dirc_mode PUSH>}> : () -> ()
    %8 = "matrix.SDDMM"(%7, %3) : (tensor<?x?xf32>, tensor<?x?xf32>) -> tensor<?x?xf32>
    %9 = "matrix.SpMM"(%0, %8) : (tensor<*xi32>, tensor<?x?xf32>) -> tensor<?x?xf32>
    graph.return %9 : tensor<?x?xf32>
    return
  }
}`,
      'custom': `经过图-矩阵转换及编译优化后
生成MatrixIR中间代码`,
      'framework': '// 这里是框架转换生成的代码'
    },
    'hardware-instruction': {
      'bfs': `% BFS的硬件指令代码
SMOVI S1, 0
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
      'sssp': `% SSSP的硬件指令代码
SMOVI S1, 0
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
GCFGI C4, 1
GCFGI C5, 1
GCFGI C6, 0
GCFGI C7, 25165824
GCFGI C8, 33554432
GCFGI C9, 0
SMOVI S6, 0
SMOVI S7, 10000
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
SNOP`,
      'wcc': `% WCC的硬件指令代码
SMOVI S1, 0
SMOVI S2, 0
SMOVI S3, 64
SDMAL2S S1, S2, S3, 0
SMOVI S1, 256
SMOVI S2, 256
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
QGENID_S Q24, S2, S3, 1
GCFGI C1, 8388608
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 0
GCFGI C5, 2
GCFGI C6, 0
GCFGI C7, 25165824
GCFGI C8, 0
GCFGI C9, 0
SMOVI S4, 0
SMOVI S5, 10000
SNOP
SBEQ S4, S5, 54
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
Q2SCHCKE S6, Q24
SNOP
SNOP
SNOP
SNOP
SBGT S6, S0, 41
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
SADDI S4, S4, 1
SNOP
SJAL S7, -55
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
SNOP`,
      'kcore': `% K-Core的硬件指令代码
SMOVI S1, 0
SMOVI S2, 0
SMOVI S3, 64
SDMAL2S S1, S2, S3, 0
SMOVI S1, 256
SMOVI S2, 256
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
SMOVI S14, 16777216
SMOVI S15, 20971520
SDMAL2V S14, S15, S1, 0
SDMABARRIER
SNOP
SNOP
SMOVI S2, 0
SLOAD S3, S0, 0
GCFGI C1, 8388608
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 0
GCFGI C5, 0
GCFGI C6, 1
GCFGI C7, 33554432
GCFGI C8, 0
GCFGI C9, 0
SMOVI S4, 0
SMOVI S5, 30
SNOP
SBEQ S4, S5, 50
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QGENID_S Q24, S2, S3, 1
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 12582912
QSLTI Q8, Q7, 10
QLOAD Q9, Q10, Q4, 16777216
QAND Q11, Q12, Q8, Q9
QXOR Q13, Q10, Q11
QSTORE Q5, Q13, 16777216
QFILTER Q14, Q6, Q12
QFORK Q15, Q16, Q14
QFORK Q17, Q18, Q15
QFORK Q19, Q20, Q16
QSLTI Q21, Q17, 0
QSQMOV Q29, Q21
QLOAD Q22, Q18, 0
QLOAD Q23, Q19, 4194304
QSQMOV Q26, Q20
QSQMOV Q27, Q22
QSQMOV Q28, Q23
GRUN
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
WAITQ Q30
QGENID_S Q24, S2, S3, 1
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 8388608
QLOAD Q8, Q4, 12582912
QSUB Q9, Q8, Q7
QSTORE Q5, Q9, 12582912
QSTORE Q6, Q0, 8388608
WAITQ Q6
SADDI S4, S4, 1
SNOP
SJAL S6, -51
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
SMOVI S14, 25165824
SMOVI S15, 16777216
SDMAV2L S14, S15, S1, 0
SMOVI S14, 29360128
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
SNOP`,
      'kclique': `% K-Clique的硬件指令代码
SMOVI S1, 0
SMOVI S2, 0
SMOVI S3, 64
SDMAL2S S1, S2, S3, 0
SMOVI S1, 256
SMOVI S2, 256
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
SMOVI S2, 0
SLOAD S3, S0, 0
QGENID_S Q24, S2, S3, 1
GCFGI C0, 8388608
GCFGI C1, 12582912
GCFGI C2, 1
GCFGI C3, 0
GCFGI C4, 0
GCFGI C5, 2
GCFGI C6, 2
GCFGI C7, 33554432
GCFGI C8, 2097152
GCFGI C9, 0
GCFGI C10, 1
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QLOAD Q7, Q3, 0
QLOAD Q8, Q4, 4194304
QSQMOV Q26, Q2
QSQMOV Q27, Q7
QSQMOV Q28, Q8
SNOP
GRUN
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
WAITQ Q30
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SMOVI S14, 16777216
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
      'ppr': `% PPR的硬件指令代码
SMOVI S1, 0
SMOVI S2, 0
SMOVI S3, 64
SDMAL2S S1, S2, S3, 0
SMOVI S1, 256
SMOVI S2, 256
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
SMOVI S14, 16777216
SMOVI S15, 20971520
SDMAL2V S14, S15, S1, 0
SDMABARRIER
SNOP
SNOP
SMOVI S2, 0
SLOAD S3, S0, 0
GCFGI C1, 8388608
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 0
GCFGI C5, 2
GCFGI C6, 2
GCFGI C7, 29360128
GCFGI C8, 0
GCFGI C9, 0
SMOVI S4, 0
SMOVI S5, 10
SNOP
SBEQ S4, S5, 48
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QGENID_S Q24, S2, S3, 1
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q8, Q3, 0
QLOAD Q9, Q10, Q4, 4194304
QSUB Q11, Q12, Q9, Q7
QSLT Q13, Q0, Q11
QSUBI Q14, Q13, 1
QSLT Q15, Q14, Q0
QADD Q16, Q12, Q15
QI2F Q17, Q16
QLOAD Q18, Q5, 12582912
QFMULI Q19, Q18, 1062836634
QFDIV Q20, Q19, Q17
QSQMOV Q29, Q20
QSQMOV Q26, Q6
QSQMOV Q27, Q8
QSQMOV Q28, Q10
GRUN
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
WAITQ Q30
QGENID_S Q24, S2, S3, 1
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 8388608
QLOAD Q8, Q4, 16777216
QFADD Q9, Q7, Q8
QSTORE Q5, Q9, 12582912
QSTORE Q6, Q0, 8388608
WAITQ Q6
SADDI S4, S4, 1
SNOP
SJAL S6, -49
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
SMOVI S14, 25165824
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
SNOP`,
      'gcn': `% GCN的硬件指令代码
SMOVI S1, 4194304
SMOVI S2, 5242880
SMOVI S3, 6291456
SMOVI S4, 7340032
SMOVI S5, 8388608
SMOVI S6, 9437184
SMOVI S7, 12582912
SMOVI S8, 16777216
SMOVI S9, 18874368
SMOVI S10, 23068672
SMOVI S11, 27262976
SMOVI S12, 31457280
SMOVI S13, 35651584
SMOVI S14, 39845888
SMOVI S31, 3145728
SMOVI S15, 256
SDMAL2S S0, S0, S15, 0
SDMABARRIER
SLOAD S15, S0, 20
SLOAD S16, S0, 12
SLOAD S17, S0, 8
SMOVI S18, 0
SMOV S19, S7
SMOV S20, S14
SSLLI S21, S17, 2
SSLLI S22, S16, 2
SSLLI S23, S15, 2
SNOP
SNOP
SNOP
SBEQ S18, S15, 94
SNOP
SNOP
SNOP
SNOP
SDMAL2V S0, S3, S22, 0
SDMAL2V S1, S4, S22, 0
SDMAL2V S5, S19, S22, 0
SDMAL2V S7, S0, S21, 1048576
SDMABARRIER
QGENID_S Q24, S0, S16, 1
GCFGI C0, 8388608
GCFGI C1, 12582912
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 1
GCFGI C5, 3
GCFGI C6, 2
GCFGI C7, 27262976
GCFGI C8, 31457280
GCFGI C9, 0
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 0
QLOAD Q8, Q4, 4194304
QLOAD Q9, Q6, 8388608
QSQMOV Q26, Q5
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
GCFGI C0, 12582912
GCFGI C1, 16777216
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 1
GCFGI C5, 3
GCFGI C6, 2
GCFGI C7, 18874368
GCFGI C8, 23068672
GCFGI C9, 0
SDMAL2V S0, S1, S21, 0
SDMAL2V S1, S2, S21, 0
SDMAL2V S8, S0, S21, 1048576
SDMABARRIER
QGENID_S Q24, S0, S17, 1
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 0
QLOAD Q8, Q4, 4194304
QLOAD Q9, Q6, 12582912
QSQMOV Q26, Q5
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
SDMAL2V S0, S0, S21, 1048576
SDMABARRIER
SNOP
QGENID_S Q24, S0, S17, 1
QFORK Q2, Q3, Q24
QLOAD Q5, Q6, Q2, 16777216
QFSUB Q7, Q0, Q5
QFLT Q8, Q9, Q7, Q0
QFILTER Q10, Q3, Q8
QFILTER Q11, Q6, Q9
QSTORE Q10, Q11, 0
WAITQ Q10
SDMAV2L S20, S0, S21, 0
SDMABARRIER
SADDI S18, S18, 1
SADD S19, S19, S22
SADD S20, S20, S21
SJAL S24, -92
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
SNOP
SLOAD S24, S0, 36
SMOVI S18, 0
SMOV S19, S8
SMOV S20, S31
SSLLI S25, S24, 2
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SBEQ S18, S24, 86
SNOP
SNOP
SNOP
SNOP
SNOP
SDMAL2V S0, S5, S23, 0
SDMAL2V S1, S6, S23, 0
SDMAL2V S5, S19, S23, 0
SDMAL2V S7, S0, S21, 1048576
SDMABARRIER
QGENID_S Q24, S0, S15, 1
GCFGI C0, 8388608
GCFGI C1, 12582912
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 1
GCFGI C5, 3
GCFGI C6, 2
GCFGI C7, 35651584
GCFGI C8, 39845888
GCFGI C9, 0
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 0
QLOAD Q8, Q4, 4194304
QLOAD Q9, Q6, 8388608
QSQMOV Q26, Q5
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
GCFGI C0, 12582912
GCFGI C1, 16777216
GCFGI C2, 0
GCFGI C3, 0
GCFGI C4, 1
GCFGI C5, 3
GCFGI C6, 2
GCFGI C7, 18874368
GCFGI C8, 23068672
GCFGI C9, 0
SDMAL2V S0, S1, S21, 0
SDMAL2V S1, S2, S21, 0
SDMAL2V S8, S0, S21, 1048576
SDMABARRIER
QGENID_S Q24, S0, S17, 1
QFORK Q1, Q2, Q24
QFORK Q3, Q4, Q1
QFORK Q5, Q6, Q2
QLOAD Q7, Q3, 0
QLOAD Q8, Q4, 4194304
QLOAD Q9, Q6, 12582912
QSQMOV Q26, Q5
QSQMOV Q27, Q7
QSQMOV Q28, Q8
QSQMOV Q29, Q9
GRUN
SNOP
SNOP
SNOP
SNOP
SNOP
WAITQ Q30
SNOP
SNOP
SMOVI S26, 16777216
SDMAV2L S20, S26, S21, 0
SDMABARRIER
SADDI S18, S18, 1
SADD S19, S19, S23
SADD S20, S20, S21
SJAL S28, -83
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
SNOP
SNOP
SNOP
`,
      'custom': `编译器后端处理MatrixIR代码
生成硬件指令代码`
    },
    'existing-framework': {
      'graphscope': {
        'bfs': `# 这里是GraphScope的BFS代码
@pregel(vd_type="int", md_type="int")
# @pregel(vd_type="unsigned", md_type="unsigned")
class BFS_Pregel(AppAssets):
  @staticmethod
  def Init(v, context):
    v.set_value(MAX_UINT)
  
  @staticmethod
  def Compute(messages, v, context):
    src_id = context.get_config(b"src")
    v.value = new_parent
    new_parent = MAX_UINT
    if v.id() == src_id:
      new_parent = v.id
    for message in messages:
      # if(new_parent == MAX_UINT):
      #     new_parent = message
      # gather_add
      new_parent = min(new_parent, message)
      # apply
      if v.value < new_parent:
        v.set_value(new_parent)
      for e_label_id in range(context.edge_label_num()):
        edges = v.outgoing_edges(e_label_id)
        for e in edges:
          # gather_mult
          v.send(e.vertex(), v.value + 1)
    v.vote_to_halt()`,
        'sssp': `# 这里是GraphScope的SSSP代码
# decorator, and assign the types for vertex data, 
# message data.
# @pregel(vd_type="double", md_type="double")
# @pregel(vd_type="float", md_type="float")
@pregel(vd_type="int", md_type="int")
class SSSP_Pregel(AppAssets):
  @staticmethod
  def Init(v, context):
      v.set_value(MAXUNIT)

  @staticmethod
  def Compute(messages, v, context):
    src_id = context.get_config(b"src")
    # construct, v.value() -> prop
    # cur_dist = v.value()
    v.value = cur_dist
    new_dist = MAXUNIT
    if v.id() == src_id:
      new_dist = 0
    for message in messages:
      # gather_add
      new_dist = min(message, new_dist)
      # apply
      # if new_dist < cur_dist:
      #     v.set_value(new_dist)
      v.set_value(min(cur_dist, new_dist))
      for e_label_id in range(context.edge_label_num()):
        edges = v.outgoing_edges(e_label_id)
        for e in edges:
          # gather_mult
          v.send(e.vertex(), new_dist + e.get_int(2))
          # v.send(e.vertex(), new_dist + e.weight())`,
        'ppr': `# 这里是GraphScope的PPR代码
import graphscope as gs
from graphscope.dataset import load_ldbc

# 加载图数据
graph = load_ldbc()

# 定义PPR算法
def ppr(graph, source):
  return gs.pagerank(graph, source)

# 执行算法
results = ppr(graph, 0)
print(results)`
      },
      'dgl': {
        'gcn': `# 这里是DGL的GCN代码
import dgl
import torch
import torch.nn as nn
import torch.nn.functional as F

# 定义GCN模型
class GCN(nn.Module):
  def __init__(self, in_feats, h_feats, num_classes):
    super(GCN, self).__init__()
    self.conv1 = dgl.nn.GraphConv(in_feats, h_feats)
    self.conv2 = dgl.nn.GraphConv(h_feats, num_classes)

  def forward(self, g, in_feat):
    h = self.conv1(g, in_feat)
    h = F.relu(h)
    h = self.conv2(g, h)
    return h

# 创建模型实例
model = GCN(10, 16, 2)`
      }
    }
  };