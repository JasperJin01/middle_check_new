// 代码数据
export const codeData = {
    'device-cga': {
      'bfs': `// <font color="red">BFS CGA代码</font>
  @kernel void bfs_kernel(@restrict const int* row_ptr,
                         @restrict const int* col_idx,
                         @restrict int* distance,
                         @restrict int* queue,
                         int start_vertex) {
      int tid = get_global_id(0);
      if (tid == 0) {
          distance[start_vertex] = 0;
          queue[0] = start_vertex;
      }
      
      for (int level = 0; level < MAX_LEVELS; level++) {
          int queue_size = get_queue_size();
          for (int i = tid; i < queue_size; i += get_global_size(0)) {
              int current = queue[i];
              int start = row_ptr[current];
              int end = row_ptr[current + 1];
              
              for (int j = start; j < end; j++) {
                  int neighbor = col_idx[j];
                  if (distance[neighbor] == -1) {
                      distance[neighbor] = level + 1;
                      enqueue(neighbor);
                  }
              }
          }
          barrier();
      }
  }`,
      'sssp': `// SSSP CGA代码
  @kernel void sssp_kernel(@restrict const int* row_ptr,
                          @restrict const int* col_idx,
                          @restrict const float* weights,
                          @restrict float* distance,
                          int start_vertex) {
      int tid = get_global_id(0);
      if (tid == 0) {
          distance[start_vertex] = 0.0f;
      }
      
      for (int iter = 0; iter < MAX_ITERATIONS; iter++) {
          bool changed = false;
          for (int i = tid; i < num_vertices; i += get_global_size(0)) {
              if (distance[i] != INFINITY) {
                  int start = row_ptr[i];
                  int end = row_ptr[i + 1];
                  
                  for (int j = start; j < end; j++) {
                      int neighbor = col_idx[j];
                      float weight = weights[j];
                      float new_dist = distance[i] + weight;
                      
                      if (new_dist < distance[neighbor]) {
                          distance[neighbor] = new_dist;
                          changed = true;
                      }
                  }
              }
          }
          barrier();
          if (!changed) break;
      }
  }`,
      'pagerank': `// PageRank CGA代码
  @kernel void pagerank_kernel(@restrict const int* row_ptr,
                              @restrict const int* col_idx,
                              @restrict float* rank,
                              @restrict float* new_rank,
                              float damping,
                              int num_vertices) {
      int tid = get_global_id(0);
      
      for (int iter = 0; iter < MAX_ITERATIONS; iter++) {
          for (int i = tid; i < num_vertices; i += get_global_size(0)) {
              int start = row_ptr[i];
              int end = row_ptr[i + 1];
              int out_degree = end - start;
              
              if (out_degree > 0) {
                  float contribution = rank[i] / out_degree;
                  for (int j = start; j < end; j++) {
                      int neighbor = col_idx[j];
                      atomic_add(&new_rank[neighbor], contribution);
                  }
              }
          }
          barrier();
          
          // 更新rank值
          for (int i = tid; i < num_vertices; i += get_global_size(0)) {
              rank[i] = (1 - damping) / num_vertices + damping * new_rank[i];
              new_rank[i] = 0.0f;
          }
          barrier();
      }
  }`
    },
    'host-code': {
      'default': `// 主机端代码
  #include <iostream>
  #include <vector>
  #include <chrono>
  
  class GraphProcessor {
  private:
      std::vector<int> row_ptr;
      std::vector<int> col_idx;
      std::vector<float> weights;
      int num_vertices;
      int num_edges;
  
  public:
      GraphProcessor(const std::string& filename) {
          loadGraph(filename);
      }
      
      void loadGraph(const std::string& filename) {
          // 加载图数据
          std::ifstream file(filename);
          file >> num_vertices >> num_edges;
          
          row_ptr.resize(num_vertices + 1);
          col_idx.resize(num_edges);
          weights.resize(num_edges);
          
          for (int i = 0; i <= num_vertices; i++) {
              file >> row_ptr[i];
          }
          
          for (int i = 0; i < num_edges; i++) {
              file >> col_idx[i] >> weights[i];
          }
      }
      
      void runAlgorithm(const std::string& algorithm) {
          auto start = std::chrono::high_resolution_clock::now();
          
          if (algorithm == "bfs") {
              runBFS();
          } else if (algorithm == "sssp") {
              runSSSP();
          } else if (algorithm == "pagerank") {
              runPageRank();
          }
          
          auto end = std::chrono::high_resolution_clock::now();
          auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
          
          std::cout << "算法执行时间: " << duration.count() << " ms" << std::endl;
      }
      
  private:
      void runBFS() {
          // BFS实现
          std::vector<int> distance(num_vertices, -1);
          std::vector<int> queue;
          
          distance[0] = 0;
          queue.push_back(0);
          
          for (int i = 0; i < queue.size(); i++) {
              int current = queue[i];
              int start = row_ptr[current];
              int end = row_ptr[current + 1];
              
              for (int j = start; j < end; j++) {
                  int neighbor = col_idx[j];
                  if (distance[neighbor] == -1) {
                      distance[neighbor] = distance[current] + 1;
                      queue.push_back(neighbor);
                  }
              }
          }
      }
      
      void runSSSP() {
          // SSSP实现
          std::vector<float> distance(num_vertices, std::numeric_limits<float>::infinity());
          distance[0] = 0.0f;
          
          for (int iter = 0; iter < num_vertices - 1; iter++) {
              bool changed = false;
              for (int i = 0; i < num_vertices; i++) {
                  if (distance[i] != std::numeric_limits<float>::infinity()) {
                      int start = row_ptr[i];
                      int end = row_ptr[i + 1];
                      
                      for (int j = start; j < end; j++) {
                          int neighbor = col_idx[j];
                          float weight = weights[j];
                          float new_dist = distance[i] + weight;
                          
                          if (new_dist < distance[neighbor]) {
                              distance[neighbor] = new_dist;
                              changed = true;
                          }
                      }
                  }
              }
              if (!changed) break;
          }
      }
      
      void runPageRank() {
          // PageRank实现
          std::vector<float> rank(num_vertices, 1.0f / num_vertices);
          std::vector<float> new_rank(num_vertices, 0.0f);
          float damping = 0.85f;
          
          for (int iter = 0; iter < 100; iter++) {
              for (int i = 0; i < num_vertices; i++) {
                  int start = row_ptr[i];
                  int end = row_ptr[i + 1];
                  int out_degree = end - start;
                  
                  if (out_degree > 0) {
                      float contribution = rank[i] / out_degree;
                      for (int j = start; j < end; j++) {
                          int neighbor = col_idx[j];
                          new_rank[neighbor] += contribution;
                      }
                  }
              }
              
              for (int i = 0; i < num_vertices; i++) {
                  rank[i] = (1 - damping) / num_vertices + damping * new_rank[i];
                  new_rank[i] = 0.0f;
              }
          }
      }
  };
  
  int main() {
      GraphProcessor processor("graph.txt");
      processor.runAlgorithm("bfs");
      return 0;
  }`
    },
    'existing-framework': {
      'graphscope': {
        'bfs': `# GraphScope BFS实现
  import graphscope as gs
  from graphscope import bfs
  
  # 加载图
  g = gs.load_from_edges(
      "graph_edges.txt",
      edge_props=["weight"],
      vertex_props=["id"]
  )
  
  # 执行BFS
  result = bfs(g, src=0)
  
  # 输出结果
  print("BFS结果:", result.to_numpy())`,
        'sssp': `# GraphScope SSSP实现
  import graphscope as gs
  from graphscope import sssp
  
  # 加载图
  g = gs.load_from_edges(
      "graph_edges.txt",
      edge_props=["weight"],
      vertex_props=["id"]
  )
  
  # 执行SSSP
  result = sssp(g, src=0)
  
  # 输出结果
  print("SSSP结果:", result.to_numpy())`,
        'ppr': `# GraphScope PPR实现
  import graphscope as gs
  from graphscope import pagerank
  
  # 加载图
  g = gs.load_from_edges(
      "graph_edges.txt",
      edge_props=["weight"],
      vertex_props=["id"]
  )
  
  # 执行PageRank
  result = pagerank(g, alpha=0.85, max_round=100)
  
  # 输出结果
  print("PageRank结果:", result.to_numpy())`
      },
      'dgl': {
        'gcn': `# DGL GCN实现
  import dgl
  import torch
  import torch.nn as nn
  import torch.nn.functional as F
  
  class GCN(nn.Module):
      def __init__(self, in_feats, hidden_size, num_classes):
          super(GCN, self).__init__()
          self.conv1 = dgl.nn.GraphConv(in_feats, hidden_size)
          self.conv2 = dgl.nn.GraphConv(hidden_size, num_classes)
      
      def forward(self, g, features):
          h = F.relu(self.conv1(g, features))
          h = self.conv2(g, h)
          return h
  
  # 创建图
  g = dgl.graph(([0,1,2,3,4], [1,2,3,4,0]))
  g = dgl.add_self_loop(g)
  
  # 创建特征
  features = torch.randn(5, 10)
  
  # 创建模型
  model = GCN(10, 16, 2)
  
  # 前向传播
  output = model(g, features)
  print("GCN输出:", output)`
      }
    },
    'graph-ir': {
      'bfs': `// BFS的GraphIR表示
  graph BFS {
    // 输入参数
    input {
      int start_vertex;
      int[] row_ptr;
      int[] col_idx;
    }
    
    // 输出参数
    output {
      int[] distance;
    }
    
    // 主要计算逻辑
    compute {
      // 初始化距离数组
      for (i in 0..num_vertices) {
        distance[i] = -1;
      }
      distance[start_vertex] = 0;
      
      // BFS主循环
      for (level in 0..max_levels) {
        // 遍历当前层的所有顶点
        for (v in active_vertices) {
          // 遍历邻居
          for (n in neighbors(v)) {
            if (distance[n] == -1) {
              distance[n] = level + 1;
              add_to_next_level(n);
            }
          }
        }
      }
    }
  }`,
      'sssp': `// SSSP的GraphIR表示
  graph SSSP {
    // 输入参数
    input {
      int start_vertex;
      int[] row_ptr;
      int[] col_idx;
      float[] weights;
    }
    
    // 输出参数
    output {
      float[] distance;
    }
    
    // 主要计算逻辑
    compute {
      // 初始化距离数组
      for (i in 0..num_vertices) {
        distance[i] = INFINITY;
      }
      distance[start_vertex] = 0;
      
      // SSSP主循环
      for (iter in 0..max_iterations) {
        bool changed = false;
        // 遍历所有顶点
        for (v in vertices) {
          if (distance[v] != INFINITY) {
            // 遍历邻居
            for (n in neighbors(v)) {
              float new_dist = distance[v] + weight(v, n);
              if (new_dist < distance[n]) {
                distance[n] = new_dist;
                changed = true;
              }
            }
          }
        }
        if (!changed) break;
      }
    }
  }`,
      'pagerank': `// PageRank的GraphIR表示
  graph PageRank {
    // 输入参数
    input {
      float damping;
      int[] row_ptr;
      int[] col_idx;
    }
    
    // 输出参数
    output {
      float[] rank;
    }
    
    // 主要计算逻辑
    compute {
      // 初始化rank值
      for (i in 0..num_vertices) {
        rank[i] = 1.0 / num_vertices;
      }
      
      // PageRank主循环
      for (iter in 0..max_iterations) {
        float[] new_rank = zeros(num_vertices);
        
        // 计算新的rank值
        for (v in vertices) {
          int out_degree = degree(v);
          if (out_degree > 0) {
            float contribution = rank[v] / out_degree;
            for (n in neighbors(v)) {
              new_rank[n] += contribution;
            }
          }
        }
        
        // 更新rank值
        for (v in vertices) {
          rank[v] = (1 - damping) / num_vertices + damping * new_rank[v];
        }
      }
    }
  }`
    },
    'matrix-ir': {
      'bfs': `// BFS的MatrixIR表示
  matrix BFS {
    // 输入矩阵
    input {
      sparse_matrix<int> adjacency_matrix;
      int start_vertex;
    }
    
    // 输出矩阵
    output {
      vector<int> distance;
    }
    
    // 主要计算逻辑
    compute {
      // 初始化距离向量
      distance = vector<int>(num_vertices, -1);
      distance[start_vertex] = 0;
      
      // BFS主循环
      for (level in 0..max_levels) {
        // 计算当前层的活跃顶点
        vector<int> active = (distance == level);
        
        // 计算下一层的距离
        vector<int> next_level = adjacency_matrix * active;
        distance = max(distance, (next_level > 0) * (level + 1));
      }
    }
  }`,
      'sssp': `// SSSP的MatrixIR表示
  matrix SSSP {
    // 输入矩阵
    input {
      sparse_matrix<float> weight_matrix;
      int start_vertex;
    }
    
    // 输出矩阵
    output {
      vector<float> distance;
    }
    
    // 主要计算逻辑
    compute {
      // 初始化距离向量
      distance = vector<float>(num_vertices, INFINITY);
      distance[start_vertex] = 0;
      
      // SSSP主循环
      for (iter in 0..max_iterations) {
        // 计算新的距离
        vector<float> new_distance = min(distance, weight_matrix * distance);
        if (new_distance == distance) break;
        distance = new_distance;
      }
    }
  }`,
      'pagerank': `// PageRank的MatrixIR表示
  matrix PageRank {
    // 输入矩阵
    input {
      sparse_matrix<float> transition_matrix;
      float damping;
    }
    
    // 输出矩阵
    output {
      vector<float> rank;
    }
    
    // 主要计算逻辑
    compute {
      // 初始化rank向量
      rank = vector<float>(num_vertices, 1.0 / num_vertices);
      
      // PageRank主循环
      for (iter in 0..max_iterations) {
        // 计算新的rank值
        rank = (1 - damping) / num_vertices + damping * (transition_matrix * rank);
      }
    }
  }`
    },
    'hardware-instruction': {
      'bfs': `// BFS的硬件指令
  .arch sm_80
  .global bfs_kernel
  
  bfs_kernel:
      // 寄存器分配
      .reg .u32 %tid, %ntid, %ctaid, %nctaid
      .reg .u32 %row_ptr, %col_idx, %distance, %queue
      .reg .u32 %start_vertex, %num_vertices
      
      // 获取线程ID
      mov.u32 %tid, %tid.x
      mov.u32 %ntid, %ntid.x
      mov.u32 %ctaid, %ctaid.x
      mov.u32 %nctaid, %nctaid.x
      
      // 初始化距离数组
      setp.eq.s32 %p1, %tid, 0
      @%p1 st.global.u32 [%distance + %start_vertex], 0
      
      // BFS主循环
      .reg .u32 %level, %queue_size, %current, %start, %end, %neighbor
      mov.u32 %level, 0
      
      loop:
          // 获取当前队列大小
          ld.global.u32 %queue_size, [%queue_size]
          
          // 遍历当前层的顶点
          setp.lt.u32 %p2, %tid, %queue_size
          @%p2 bra process_vertex
          
          // 处理顶点
          process_vertex:
              ld.global.u32 %current, [%queue + %tid]
              ld.global.u32 %start, [%row_ptr + %current]
              ld.global.u32 %end, [%row_ptr + %current + 1]
              
              // 遍历邻居
              loop_neighbors:
                  ld.global.u32 %neighbor, [%col_idx + %start]
                  ld.global.u32 %dist, [%distance + %neighbor]
                  setp.eq.s32 %p3, %dist, -1
                  @%p3 st.global.u32 [%distance + %neighbor], %level
                  add.u32 %start, %start, 1
                  setp.lt.u32 %p4, %start, %end
                  @%p4 bra loop_neighbors
          
          // 同步所有线程
          bar.sync 0
          
          // 检查是否继续
          add.u32 %level, %level, 1
          setp.lt.u32 %p5, %level, %max_levels
          @%p5 bra loop
          
      ret;`,
      'sssp': `// SSSP的硬件指令
  .arch sm_80
  .global sssp_kernel
  
  sssp_kernel:
      // 寄存器分配
      .reg .u32 %tid, %ntid, %ctaid, %nctaid
      .reg .u32 %row_ptr, %col_idx, %weights, %distance
      .reg .u32 %start_vertex, %num_vertices
      
      // 获取线程ID
      mov.u32 %tid, %tid.x
      mov.u32 %ntid, %ntid.x
      mov.u32 %ctaid, %ctaid.x
      mov.u32 %nctaid, %nctaid.x
      
      // 初始化距离数组
      setp.eq.s32 %p1, %tid, 0
      @%p1 st.global.f32 [%distance + %start_vertex], 0.0
      
      // SSSP主循环
      .reg .u32 %iter, %v, %start, %end, %neighbor
      .reg .f32 %weight, %new_dist
      .reg .pred %changed
      
      mov.u32 %iter, 0
      
      loop:
          // 遍历所有顶点
          setp.lt.u32 %p2, %tid, %num_vertices
          @%p2 bra process_vertex
          
          // 处理顶点
          process_vertex:
              ld.global.f32 %dist, [%distance + %tid]
              setp.ne.f32 %p3, %dist, INFINITY
              @%p3 bra process_neighbors
              bra next_iter
              
              process_neighbors:
                  ld.global.u32 %start, [%row_ptr + %tid]
                  ld.global.u32 %end, [%row_ptr + %tid + 1]
                  
                  // 遍历邻居
                  loop_neighbors:
                      ld.global.u32 %neighbor, [%col_idx + %start]
                      ld.global.f32 %weight, [%weights + %start]
                      ld.global.f32 %dist, [%distance + %tid]
                      add.f32 %new_dist, %dist, %weight
                      ld.global.f32 %neighbor_dist, [%distance + %neighbor]
                      setp.lt.f32 %p4, %new_dist, %neighbor_dist
                      @%p4 st.global.f32 [%distance + %neighbor], %new_dist
                      add.u32 %start, %start, 1
                      setp.lt.u32 %p5, %start, %end
                      @%p5 bra loop_neighbors
          
          next_iter:
              // 同步所有线程
              bar.sync 0
              
              // 检查是否继续
              add.u32 %iter, %iter, 1
              setp.lt.u32 %p6, %iter, %max_iterations
              @%p6 bra loop
          
      ret;`,
      'pagerank': `// PageRank的硬件指令
  .arch sm_80
  .global pagerank_kernel
  
  pagerank_kernel:
      // 寄存器分配
      .reg .u32 %tid, %ntid, %ctaid, %nctaid
      .reg .u32 %row_ptr, %col_idx, %rank, %new_rank
      .reg .f32 %damping, %num_vertices
      
      // 获取线程ID
      mov.u32 %tid, %tid.x
      mov.u32 %ntid, %ntid.x
      mov.u32 %ctaid, %ctaid.x
      mov.u32 %nctaid, %nctaid.x
      
      // 初始化rank值
      .reg .f32 %init_rank
      div.f32 %init_rank, 1.0, %num_vertices
      st.global.f32 [%rank + %tid], %init_rank
      
      // PageRank主循环
      .reg .u32 %iter, %start, %end, %neighbor
      .reg .f32 %contribution, %new_value
      
      mov.u32 %iter, 0
      
      loop:
          // 计算新的rank值
          ld.global.u32 %start, [%row_ptr + %tid]
          ld.global.u32 %end, [%row_ptr + %tid + 1]
          ld.global.f32 %rank_value, [%rank + %tid]
          
          // 计算出度
          sub.u32 %out_degree, %end, %start
          setp.gt.u32 %p1, %out_degree, 0
          @%p1 bra process_neighbors
          bra next_iter
          
          process_neighbors:
              div.f32 %contribution, %rank_value, %out_degree
              
              // 遍历邻居
              loop_neighbors:
                  ld.global.u32 %neighbor, [%col_idx + %start]
                  ld.global.f32 %current_rank, [%new_rank + %neighbor]
                  add.f32 %new_value, %current_rank, %contribution
                  st.global.f32 [%new_rank + %neighbor], %new_value
                  add.u32 %start, %start, 1
                  setp.lt.u32 %p2, %start, %end
                  @%p2 bra loop_neighbors
          
          next_iter:
              // 同步所有线程
              bar.sync 0
              
              // 更新rank值
              ld.global.f32 %new_rank_value, [%new_rank + %tid]
              mul.f32 %new_rank_value, %new_rank_value, %damping
              add.f32 %new_rank_value, %new_rank_value, %init_rank
              st.global.f32 [%rank + %tid], %new_rank_value
              st.global.f32 [%new_rank + %tid], 0.0
              
              // 检查是否继续
              add.u32 %iter, %iter, 1
              setp.lt.u32 %p3, %iter, %max_iterations
              @%p3 bra loop
          
      ret;`
    }
  };