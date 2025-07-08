// 代码数据
export const codeData = {
  'g++':  `cmake_minimum_required(VERSION 3.5.0)

project(simulator)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)

# 设置构建类型：Debug/Release
set(CMAKE_BUILD_TYPE "Debug")
# CMAKE_BUILD_TYPE为Debug时的编译选项
set(CMAKE_CXX_FLAGS_DEBUG "$ENV{CXXFLAGS} -O0 -Wall -g -fexceptions -Wno-sign-compare -Wno-unused-result")
# CMAKE_BUILD_TYPE为Release时的编译选项
set(CMAKE_CXX_FLAGS_RELEASE "$ENV{CXXFLAGS} -Wall -fexceptions -Wno-sign-compare -Wno-unused-result")

# 添加子项目
add_subdirectory(\${CMAKE_SOURCE_DIR}/3rd/asm-compiler)
add_subdirectory(\${CMAKE_SOURCE_DIR}/3rd/graph-driver/sdk)
add_subdirectory(\${CMAKE_SOURCE_DIR}/3rd/DRAMsim3)
add_subdirectory(\${CMAKE_SOURCE_DIR}/3rd/eigen)

# 添加头文件目录，相当于g++的-I参数
include_directories(
    ./inc test/inc ./compiler/inc
    ./3rd/asm-compiler/include
    ./3rd/graph-driver/sdk/include
)

# 添加link的目录，相当于g++的-L参数
# link_directories()

# 收集所有源文件，保存到变量SRCS中
aux_source_directory(src/backend SRCS)
aux_source_directory(src/backend/commit SRCS)
aux_source_directory(src/backend/executor SRCS)
aux_source_directory(src/backend/executor/scalar SRCS)
aux_source_directory(src/backend/executor/graph SRCS)
aux_source_directory(src/backend/executor/queue SRCS)
aux_source_directory(src/backend/executor/spec SRCS)
aux_source_directory(src/backend/executor/vector SRCS)
aux_source_directory(src/backend/qregfile SRCS)
aux_source_directory(src/backend/scheduler SRCS)
aux_source_directory(src/backend/scheduler/sub_sched SRCS)
aux_source_directory(src/backend/sregfile SRCS)
aux_source_directory(src/backend/vregfile SRCS)
aux_source_directory(src/dma SRCS)
aux_source_directory(src/dma/utils SRCS)
aux_source_directory(src/dma/sub_mod SRCS)
aux_source_directory(src/frontend SRCS)
aux_source_directory(src/frontend/decode SRCS)
aux_source_directory(src/frontend/fetch SRCS)
aux_source_directory(src/frontend/inst_mem SRCS)
aux_source_directory(src/frontend/issue SRCS)
aux_source_directory(src/frontend/scoreboard SRCS)
aux_source_directory(src/processor SRCS)
aux_source_directory(src/spm SRCS)
aux_source_directory(src/spm/s_spm SRCS)
aux_source_directory(src/spm/v_spm SRCS)
aux_source_directory(src/utils SRCS)
aux_source_directory(synopsys/ip SRCS)
aux_source_directory(adaptor/arithmetic SRCS)
aux_source_directory(adaptor/arithmetic/FP32 SRCS)
aux_source_directory(adaptor/fifo SRCS)
aux_source_directory(adaptor/sram SRCS)
aux_source_directory(adaptor/dram SRCS)

aux_source_directory(compiler/src SRCS)
aux_source_directory(simulator SRCS)

message(status "\${SRCS}")
# 如果要增加其他源文件，可以继续使用aux_source_directory命令
# aux_source_directory(./xxx SRCS)

# 添加一个静态库目标
add_library(src_lib STATIC \${SRCS}
        test/inc/simulator_test.h
        src/backend/executor/scalar/scalar_exer.cpp
        src/backend/executor/scalar/scalar_exer_top.cpp
        src/backend/executor/vector/vexer_com.cpp
        src/backend/executor/vector/vexer_top.cpp
        src/backend/executor/vector/vexer_special.cpp)

add_dependencies(src_lib asm_lib)

# 添加一个可执行目标
# add_executable(sim ./src/main.cpp)

# 可执行目标需要与src_lib链接
# target_link_libraries(sim src_lib)

# test相关的配置
include_directories(
    ./3rd/googletest/googletest/include
)
link_directories(
    ./3rd/googletest/lib
)

# Dramsim3相关的配置
include_directories(
    ./3rd/DRAMsim3/src
    ./3rd/DRAMsim3/ext/headers
)
link_directories(
    ./3rd/DRAMsim3
)

include_directories((
    ./3rd/eigen/Eigen
))
link_directories(
    ./3rd/eigen
)

aux_source_directory(test/simulator TESTS)

foreach (v \${TESTS})
    string (REGEX MATCH "test/.*" relative_path \${v})
    string (REGEX REPLACE "test.*/" "" target_name \${relative_path})
    string (REGEX REPLACE ".cpp" "" target_name \${target_name})
    message("\${target_name}")
    add_executable (test_\${target_name} \${relative_path})
    target_link_libraries (test_\${target_name} gtest pthread src_lib asm_lib sdk_lib dramsim3 eigen)
endforeach()

add_custom_target(
    "run_test"
    COMMENT
    "Run all testcase to check code"
)
add_custom_target(
    "run_testsuit"
    COMMENT
    "Run testuit"
)
add_custom_command(
    TARGET "run_test"
    POST_BUILD
    COMMENT "Copy bash script and Run all testcase"
    COMMAND
    cp \${PROJECT_SOURCE_DIR}/run_test.sh \${CMAKE_CURRENT_BINARY_DIR}
    COMMAND
    bash run_test.sh
)

add_custom_command(
    TARGET "run_testsuit"
    POST_BUILD
    COMMENT "Copy bash script and Run testsuit"
    COMMAND
    cp \${PROJECT_SOURCE_DIR}/testsuit.sh \${CMAKE_CURRENT_BINARY_DIR}
    COMMAND
    bash testsuit.sh
)

# doxy生成文档相关的配置
#find_package(Doxygen REQUIRED)
#set (DOXYGEN_GENERATE_HTML "YES" CACHE STRING "Doxygen HTML output")
#set (DOXYGEN_GENERATE_LATEX "NO" CACHE STRING "Doxygen LATEX output")
#set (DOXYGEN_FILE_PATTERNS *.cpp *.h *.md CACHE STRING "Doxygen File Patterns")
#set (DOXYGEN_EXTRACT_ALL YES)
#set (DOXYGEN_CALL_GRAPH YES)
#set (DOXYGEN_CALLER_GRAPH YES)
#set (DOXYGEN_USE_MDFILE_AS_MAINPAGE README.md)
#set (DOXYGEN_EXCLUDE_PATTERNS */test/* */3rd/* */build/* */doc/* CACHE STRING "Doxygen exclude patterns")
#set (DOXYGEN_PROJECT_NUMBER \${CMAKE_PROJECT_VERSION} CACHE STRING "")
#set (DOXYGEN_GENERATE_TREEVIW YES)
#set (DOXYGEN_DISABLE_INDEX NO)
#set (DOXYGEN_HAVE_DOT YES)
#set (DOXYGEN_OUTPUT_DIRECTORY \${PROJECT_SOURCE_DIR}/doc)
#message(STATUS "project source dir: " \${PROJECT_SOURCE_DIR})
#doxygen_add_docs (doc
#    \${PROJECT_SOURCE_DIR}/src
#    \${PROJECT_SOURCE_DIR}/inc
#    \${PROJECT_SOURCE_DIR}
#    COMMENT "Generating documents vis Doxygen"
#)
`,
  'bin':`47 72 61 70 68 20 55 6e 69 74 20 4b 65 72 6e 65 
6c 20 42 69 6e 61 72 79 20 46 6f 72 6d 61 74 0a 
69 6e 73 74 20 63 6f 75 6e 74 3a 31 31 36 2c 20 
74 6f 74 61 6c 20 73 69 7a 65 3a 33 37 31 32 0a 
62 69 6e 61 72 79 20 73 65 63 74 69 6f 6e 3a 0a 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 20 00 01 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 20 00 02 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
40 00 00 00 20 00 03 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 e0 10 01 09 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 01 00 00 20 00 01 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 01 00 00 20 00 02 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
40 00 00 00 20 00 03 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 e0 10 01 09 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 06 00 00 09 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 01 00 00 22 00 01 07 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 20 00 0e 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 40 00 20 00 0f 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 62 78 0e 09 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 40 00 20 00 0e 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 80 00 20 00 0f 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 62 78 0e 09 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 80 00 20 00 0e 03 00 00 00 00 00 00 00 00 
ab 00 00 00 ab 00 00 00 ab 00 00 00 ab 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
`,
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

distGraph.MPI_Finalize();`,
      'framework': `// 这是框架转换生成的主机代码`,
      'kclique': `#include <iostream>
#include "simulator.h"
#include "graph_sdk/aas/aas.h"
#include "graph_utils.h"
#include "mm_utils.h"

extern int total_send_e_task;

#define CORE_NUM (SIMD_WIDTH)
#define MAX_V_NUM 5000000
#define MAX_SIMULATE_CYCLE 10000000000

using namespace graph_mm;

int v_num, e_num;
int *off;
int *edge;
// 要求测试的图是无向图，因此facebook不行。跑出来的结果没啥意义。
// 这里加反向边是因为从数据中导入的无向图是没有反向边的，需要手动加上
char file_name[] = "../data/data_edgelist/euroroad.txt";
load_graph_edgelist(v_num, e_num, off, edge, file_name);
int off_new[v_num + 1] = {0};
int edge_new[2 * e_num] = {0};
graph_add_reverse_edge(v_num, e_num, off, edge, off_new, edge_new);

int soc_old[v_num] = {0};
int soc_new[v_num] = {0};
int cpu_res[v_num] = {0};
printf("Dump offset: \\n");
for (int i = 0; i <= v_num; i++)
{
    printf("%d ", off[i]);
}
printf("Dump offset: \\n");
for (int i = 0; i < v_num; i++)
{
    cpu_res[i] = i;
    soc_old[i] = i;
}
kc_push(v_num, edge_new, off_new, cpu_res);
///home/work/hjq/cycle-accurate-sim/test/asm/asm_compiler/kc.asm
std::string bfs_asm = std::string("../test/asm_test/GraphTraversal/kc_test.asm");
std::string bfs_bin = std::string("../test/asm_test/GraphTraversal/kc_test.bin");

m_simulator->parse_asm_to_bin(bfs_asm.c_str(), bfs_bin.c_str());

m_aas->wait_event(AAS_SOC_READY);
printf("[Simulator]: SOC ready, begin to dma data\\n");

// 1. DMA 数据
m_aas->dma_graph_data((char*)(&v_num), 0 , sizeof(int));
int v_num_aligned = (v_num*4 + 255) & (~(255)); 
printf("Aligned v_num : %d\\n", v_num_aligned);
m_aas->dma_graph_data((char*)(&v_num_aligned),  256, sizeof(int));
                                
m_aas->dma_graph_data((char *)off_new, 4 * 1024 * 1024, sizeof(int) * (v_num));                     // st
m_aas->dma_graph_data((char *)&(off_new[1]), 8 * 1024 * 1024, sizeof(int) * (v_num)); // ed
m_aas->dma_graph_data((char *)(soc_old), 12 * 1024 * 1024, sizeof(int) * (v_num));     // old_v
m_aas->dma_graph_data((char *)(soc_old), 16 * 1024 * 1024, sizeof(int) * (v_num));    // new_v

        
m_aas->dma_graph_data((char *)edge_new, 24 * 1024 * 1024, sizeof(int) * e_num * 2); // edge

// 2. 启动计算
m_aas->start_kernel(bfs_bin.c_str());

// 3. 等待计算完成
m_aas->wait_event(AAS_SOC_KERNEL_DONE);

// 4. 检测计算结果
printf("[Simulator]: copy data from lpddr to CPU ...\\n");
/// 4.1 ASM中将结果写入lpddr的位置, 因此从lpddr的位置读取到CPU端
// old_v写回2048  new_v写回2304
m_aas->dma_from_lpddr((char *)soc_new, 20 * 1024 * 1024, sizeof(int) * v_num);
printf("[Simulator]: LPDDR to CPU done, check result\\n");

m_aas->stop_core();

// 5. 等待本轮SOC模拟退出
m_aas->wait_event(AAS_SOC_DONE);

bool passed = true;
for (int i = 0; i < v_num; i++)
{
    if (soc_new[i] != cpu_res[i])
    {
        passed = false;
        printf("Err on %d, soc res:%d, expected res:%d\\n", i, soc_new[i], cpu_res[i]);
        EXPECT_EQ(soc_new[i], cpu_res[i]);
    }
}
if (passed)
{
    int freq = 150;
    printf("[Simulator]: bfs passed\\n");
    printf("[Simulator]: bfs core start clk: %d\\n", m_simulator->_core_start_clk);
    printf("[Simulator]: bfs core end clk: %d\\n", m_simulator->_core_end_clk);
    printf("[Simulator]: bfs do edge task: %d\\n", total_send_e_task);
    printf("[Simulator]: freq=%d MHz, bfs performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
    freq = 1000;
    printf("[Simulator]: freq=%d MHz, bfs performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
}
else
{
    printf("[Simulator]: bfs NOT passed\\n");
}
printf("CPU result: \\n");
for (int i = 0; i < v_num; i++)
{
    printf("Node : %d, Tag : %d\\n", i, cpu_res[i]);
}
printf("Kernel result: \\n");
printf("RES new_v: \\n");
for (int i = 0; i < v_num; i++)
{
    printf("Node : %d, Tag : %d\\n", i, soc_new[i]);
}
printf("KC res : \\n");
if (passed)
{
    Print_KC(v_num, soc_new);
}
`,
      'kcore': `#include <iostream>
#include "simulator.h"
#include "graph_sdk/aas/aas.h"
#include "graph_utils.h"
#include "mm_utils.h"

extern int total_send_e_task;

#define CORE_NUM (SIMD_WIDTH)
#define MAX_V_NUM 5000000
#define MAX_SIMULATE_CYCLE 10000000000

using namespace graph_mm;

int v_num, e_num;
int *off;
int *edge;
char off_name[] = "../data/facebook_off.txt";
char list_name[] = "../data/facebook_list.txt";
load_graph(v_num, e_num, off, edge, off_name, list_name);
int *off_new = new int[v_num + 1];
int *edge_new = new int[2 * e_num];
graph_add_reverse_edge(v_num, e_num, off, edge, off_new, edge_new);
printf("edge new : \\n");
// for(int i=0 ;i<2*e_num; ++i){
//    printf("%d,", edge_new[i]);
// }
// printf("\\n");

int init_v[v_num] = {0};
int init_newv[v_num] = {0};
int soc_res[v_num] = {0};
int degree_res[v_num] = {0};
int cpu_res[v_num] = {0};
int cpu_res_degree[v_num] = {0};
int degree[v_num] = {0};
for (int i = 0; i < v_num; i++)
{
    cpu_res[i] = 1;
    init_v[i] = 1;
    degree_res[i] = 0;
    init_newv[i] = 0;
    degree[i] = off_new[i + 1] - off_new[i];
}
// facebook的节点度数都挺高的，得找10k-core，图可能进行预处理了？
// 倒数第三个参数是是Kcore 的 K值，在这里修改之后也要记得修改汇编
// 58 QSLTI Q8, Q7, 10 
int iter = kcore_push(v_num, edge_new, off_new, cpu_res, cpu_res_degree, 10, true, 30);

std::string sssp_asm = std::string("../test/asm_test/GraphTraversal/kcore_test.asm");
std::string sssp_bin = std::string("../test/asm_test/GraphTraversal/kcore_test.bin");

m_simulator->parse_asm_to_bin(sssp_asm.c_str(), sssp_bin.c_str());

m_aas->wait_event(AAS_SOC_READY);
printf("[Simulator]: SOC ready, begin to dma data\\n");

// 1. DMA 数据
// DDR->SPM
m_aas->dma_graph_data((char*)(&v_num), 0 , sizeof(int));
int v_num_aligned = (v_num*4 + 255) & (~(255)); 
printf("Aligned v_num : %d\\n", v_num_aligned);
m_aas->dma_graph_data((char*)(&v_num_aligned),  256, sizeof(int));
                                        
m_aas->dma_graph_data((char *)off_new, 4 * 1024 * 1024, sizeof(int) * (v_num));                     // st
m_aas->dma_graph_data((char *)&(off_new[1]), 8 * 1024 * 1024, sizeof(int) * (v_num)); // ed
// new_v 计算结果，每次更新要置0
m_aas->dma_graph_data((char *)(init_newv), 12 * 1024 * 1024, sizeof(int) * (v_num)); // new_v
// node_mask 初始化全1
m_aas->dma_graph_data((char *)(degree), 16 * 1024 * 1024, sizeof(int) * (v_num)); // degree
m_aas->dma_graph_data((char *)(init_v), 20 * 1024 * 1024, sizeof(int) * (v_num)); // node_mask

                                                                                    // DDR上的边数据
                                                                    
m_aas->dma_graph_data((char *)edge_new, 32 * 1024 * 1024, sizeof(int) * (e_num * 2)); // edge

// 2. 启动计算
m_aas->start_kernel(sssp_bin.c_str());

// 3. 等待计算完成
m_aas->wait_event(AAS_SOC_KERNEL_DONE);

// 4. 检测计算结果
printf("[Simulator]: copy data from lpddr to CPU ...\\n");
/// 4.1 ASM中将结果写入lpddr的位置, 因此从lpddr的位置读取到CPU端
// old_v写回2048  new_v写回2304
m_aas->dma_from_lpddr((char *)soc_res, 24 * 1024 * 1024, sizeof(int) * v_num);
m_aas->dma_from_lpddr((char *)degree_res, 28 * 1024 * 1024, sizeof(int) * v_num);
printf("[Simulator]: LPDDR to CPU done, check result\\n");

m_aas->stop_core();

// 5. 等待本轮SOC模拟退出
m_aas->wait_event(AAS_SOC_DONE);

bool passed = true;
for (int i = 0; i < v_num; i++)
{
    if (soc_res[i] != cpu_res[i])
    {
        passed = false;
        printf("Err on %d, soc res:%d, expected res:%d\\n", i, soc_res[i], cpu_res[i]);
        EXPECT_EQ(soc_res[i], cpu_res[i]);
    }

    // if (degree_res[i] != cpu_res_degree[i]) {
    //     passed = false;
    //     printf("Err on %d, degree_res:%d, expected res:%d\\n", i, degree_res[i], cpu_res_degree[i]);
    //     EXPECT_EQ(degree_res[i], cpu_res_degree[i]);
    // }
}

if (passed)
{
    int freq = 150;
    printf("[Simulator]: sssp passed\\n");
    printf("[Simulator]: sssp core start clk: %d\\n", m_simulator->_core_start_clk);
    printf("[Simulator]: sssp core end clk: %d\\n", m_simulator->_core_end_clk);
    printf("[Simulator]: sssp do edge task: %d\\n", total_send_e_task);
    printf("[Simulator]: freq=%d MHz, sssp performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
    freq = 1000;
    printf("[Simulator]: freq=%d MHz, sssp performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
}
else
{
    printf("[Simulator]: sssp NOT passed\\n");
}

printf("CPU result: \\n");
for (int i = 0; i < v_num; i++)
{
    printf("Node : %d, tag : %d\\n", i, cpu_res[i]);
}
printf("Kernel result: \\n");
printf("RES node_mask: \\n");
for (int i = 0; i < v_num; i++)
{
    printf("Node : %d, tag : %d\\n", i, soc_res[i]);
}`,
      'wcc': `#include <iostream>
#include "simulator.h"
#include "graph_sdk/aas/aas.h"
#include "graph_utils.h"
#include "mm_utils.h"

extern int total_send_e_task;

#define CORE_NUM (SIMD_WIDTH)
#define MAX_V_NUM 5000000
#define MAX_SIMULATE_CYCLE 10000000000

using namespace graph_mm;

int v_num, e_num;
int *off;
int *edge;
// 要求测试的图是无向图，因此facebook不行。跑出来的结果没啥意义。
// 这里加反向边是因为从数据中导入的无向图是没有反向边的，需要手动加上
char file_name[] = "../data/data_edgelist/euroroad.txt";
load_graph_edgelist(v_num, e_num, off, edge, file_name);
int off_new[v_num + 1] = {0};
int edge_new[2 * e_num] = {0};
graph_add_reverse_edge(v_num, e_num, off, edge, off_new, edge_new);

int soc_old[v_num] = {0};
int soc_new[v_num] = {0};
int cpu_res[v_num] = {0};
printf("Dump offset: \\n");
for (int i = 0; i <= v_num; i++)
{
    printf("%d ", off[i]);
}
printf("Dump offset: \\n");
for (int i = 0; i < v_num; i++)
{
    cpu_res[i] = i;
    soc_old[i] = i;
}
wcc_push(v_num, edge_new, off_new, cpu_res);
///home/work/hjq/cycle-accurate-sim/test/asm/asm_compiler/wcc.asm
std::string bfs_asm = std::string("../test/asm_test/GraphTraversal/wcc_test.asm");
std::string bfs_bin = std::string("../test/asm_test/GraphTraversal/wcc_test.bin");

m_simulator->parse_asm_to_bin(bfs_asm.c_str(), bfs_bin.c_str());

m_aas->wait_event(AAS_SOC_READY);
printf("[Simulator]: SOC ready, begin to dma data\\n");

// 1. DMA 数据
m_aas->dma_graph_data((char*)(&v_num), 0 , sizeof(int));
int v_num_aligned = (v_num*4 + 255) & (~(255)); 
printf("Aligned v_num : %d\\n", v_num_aligned);
m_aas->dma_graph_data((char*)(&v_num_aligned),  256, sizeof(int));
                                
m_aas->dma_graph_data((char *)off_new, 4 * 1024 * 1024, sizeof(int) * (v_num));                     // st
m_aas->dma_graph_data((char *)&(off_new[1]), 8 * 1024 * 1024, sizeof(int) * (v_num)); // ed
m_aas->dma_graph_data((char *)(soc_old), 12 * 1024 * 1024, sizeof(int) * (v_num));     // old_v
m_aas->dma_graph_data((char *)(soc_old), 16 * 1024 * 1024, sizeof(int) * (v_num));    // new_v

        
m_aas->dma_graph_data((char *)edge_new, 24 * 1024 * 1024, sizeof(int) * e_num * 2); // edge

// 2. 启动计算
m_aas->start_kernel(bfs_bin.c_str());

// 3. 等待计算完成
m_aas->wait_event(AAS_SOC_KERNEL_DONE);

// 4. 检测计算结果
printf("[Simulator]: copy data from lpddr to CPU ...\\n");
/// 4.1 ASM中将结果写入lpddr的位置, 因此从lpddr的位置读取到CPU端
// old_v写回2048  new_v写回2304
m_aas->dma_from_lpddr((char *)soc_new, 20 * 1024 * 1024, sizeof(int) * v_num);
printf("[Simulator]: LPDDR to CPU done, check result\\n");

m_aas->stop_core();

// 5. 等待本轮SOC模拟退出
m_aas->wait_event(AAS_SOC_DONE);

bool passed = true;
for (int i = 0; i < v_num; i++)
{
    if (soc_new[i] != cpu_res[i])
    {
        passed = false;
        printf("Err on %d, soc res:%d, expected res:%d\\n", i, soc_new[i], cpu_res[i]);
        EXPECT_EQ(soc_new[i], cpu_res[i]);
    }
}
if (passed)
{
    int freq = 150;
    printf("[Simulator]: bfs passed\\n");
    printf("[Simulator]: bfs core start clk: %d\\n", m_simulator->_core_start_clk);
    printf("[Simulator]: bfs core end clk: %d\\n", m_simulator->_core_end_clk);
    printf("[Simulator]: bfs do edge task: %d\\n", total_send_e_task);
    printf("[Simulator]: freq=%d MHz, bfs performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
    freq = 1000;
    printf("[Simulator]: freq=%d MHz, bfs performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
}
else
{
    printf("[Simulator]: bfs NOT passed\\n");
}
printf("CPU result: \\n");
for (int i = 0; i < v_num; i++)
{
    printf("Node : %d, Tag : %d\\n", i, cpu_res[i]);
}
printf("Kernel result: \\n");
printf("RES new_v: \\n");
for (int i = 0; i < v_num; i++)
{
    printf("Node : %d, Tag : %d\\n", i, soc_new[i]);
}
printf("CC res : \\n");
if (passed)
{
    Print_CC(v_num, soc_new);
}
`,
      'sssp': `#include <iostream>
#include "simulator.h"
#include "graph_sdk/aas/aas.h"
#include "graph_utils.h"
#include "mm_utils.h"

extern int total_send_e_task;

#define CORE_NUM (SIMD_WIDTH)
#define MAX_V_NUM 5000000
#define MAX_SIMULATE_CYCLE 10000000000

using namespace graph_mm;

std::string sssp_asm = std::string("../test/asm/sssp_int_push_sync_dma.asm");
std::string sssp_bin = std::string("../test/asm/sssp_int_push_sync_dma.bin");

m_simulator->parse_asm_to_bin(sssp_asm.c_str(), sssp_bin.c_str());

m_aas->wait_event(AAS_SOC_READY);
printf("[Simulator]: SOC ready, begin to dma data\\n");

// 1. DMA 数据
int v_num = vertex_num;
int e_num = 25;
m_aas->dma_graph_data((char*)off, 0, sizeof(int)* (v_num));  // st
m_aas->dma_graph_data((char*)&(off[1]), 4*1024*1024, sizeof(int)* (v_num));  // ed
m_aas->dma_graph_data((char*)(init_v), 8*1024*1024, sizeof(int)* (v_num));  // old_v
m_aas->dma_graph_data((char*)(init_v), 12*1024*1024, sizeof(int)* (v_num));  // new_v

m_aas->dma_graph_data((char*)edge, 24*1024*1024, sizeof(int)* e_num);   // edge
m_aas->dma_graph_data((char*)weight, 48*1024*1024, sizeof(int)* e_num);   // edge

// 2. 启动计算
m_aas->start_kernel(sssp_bin.c_str());

// 3. 等待计算完成
m_aas->wait_event(AAS_SOC_KERNEL_DONE);

// 4. 检测计算结果
printf("[Simulator]: copy data from lpddr to CPU ...\\n");
/// 4.1 ASM中将结果写入lpddr的位置, 因此从lpddr的位置读取到CPU端
// old_v写回2048  new_v写回2304
m_aas->dma_from_lpddr((char*)soc_old, 16*1024*1024, sizeof(int)*v_num);
m_aas->dma_from_lpddr((char*)soc_new, 20*1024*1024, sizeof(int)*v_num);
printf("[Simulator]: LPDDR to CPU done, check result\\n");

m_aas->stop_core();

// 5. 等待本轮SOC模拟退出
m_aas->wait_event(AAS_SOC_DONE);

bool passed = true;
for (int i = 0; i < vertex_num; i++) {
    if (soc_new[i] != cpu_res[i]) {
        passed = false;
        printf("Err on %d, soc res:%d, expected res:%d\\n", i, soc_new[i], cpu_res[i]);
        EXPECT_EQ(soc_new[i], cpu_res[i]);
    }
}
if (passed) {
    int freq = 150;
    printf("[Simulator]: sssp passed\\n");
    printf("[Simulator]: sssp core start clk: %d\\n", m_simulator->_core_start_clk);
    printf("[Simulator]: sssp core end clk: %d\\n", m_simulator->_core_end_clk);
    printf("[Simulator]: sssp do edge task: %d\\n", total_send_e_task);
    printf("[Simulator]: freq=%d MHz, sssp performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
    freq = 1000;
    printf("[Simulator]: freq=%d MHz, sssp performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
} else {
    printf("[Simulator]: sssp NOT passed\\n");
}
printf("CPU result: \\n");
for (int i = 0; i < vertex_num; i++) {
    printf("Node : %d, Depth : %d\\n", i, cpu_res[i]);
}
printf("Kernel result: \\n");
printf("RES old_v: \\n");
for (int i = 0; i < vertex_num; i++) {
    printf("Node : %d, Depth : %d\\n", i, soc_old[i]);
}
printf("RES new_v: \\n");
for (int i = 0; i < vertex_num; i++) {
    printf("Node : %d, Depth : %d\\n", i, soc_new[i]);
}
printf("Edge value: \\n");
for (int i = 0; i < vertex_num; i++) {
    int left = off[i];
    int right = off[i + 1];
    printf("Node: %d has edge\\n", i);
    for (int j = left; j < right; ++ j) {
        int dst = edge[j];
        int value = weight[j];
        printf("To %d, value : %d\\n", dst, value );
    }
}`,
      'bfs': `#include <iostream>
#include "simulator.h"
#include "graph_sdk/aas/aas.h"
#include "graph_utils.h"
#include "mm_utils.h"

extern int total_send_e_task;

#define CORE_NUM (SIMD_WIDTH)
#define MAX_V_NUM 5000000
#define MAX_SIMULATE_CYCLE 10000000000

using namespace graph_mm;

std::string bfs_asm = std::string("../test/asm/bfs_push_async_dma_small_graph.asm");
std::string bfs_bin = std::string("../test/asm/bfs_push_async_dma_small_graph.bin");
m_simulator->parse_asm_to_bin(bfs_asm.c_str(), bfs_bin.c_str());

m_aas->wait_event(AAS_SOC_READY);
printf("[Simulator]: SOC ready, begin to dma data\\n");

// 1. DMA 数据
m_aas->dma_graph_data((char*)edge, 0, sizeof(int)* 24);
m_aas->dma_graph_data((char*)off, 1024, sizeof(int)* (vertex_num));
m_aas->dma_graph_data((char*)&(off[1]), 1024 + 256, sizeof(int)* (vertex_num));
m_aas->dma_graph_data((char*)(init_v), 1792, sizeof(int)* (16));

// 2. 启动计算
m_aas->start_kernel(bfs_bin.c_str());

// 3. 等待计算完成
m_aas->wait_event(AAS_SOC_KERNEL_DONE);

// 4. 检测计算结果
printf("[Simulator]: copy data from lpddr to CPU ...\\n");
/// 4.1 ASM中将结果写入lpddr的2048位置, 因此从lpddr的2048位置读取到CPU端
m_aas->dma_from_lpddr((char*)soc_res, 2048, sizeof(int)*vertex_num);
printf("[Simulator]: LPDDR to CPU done, check result\\n");

m_aas->stop_core();

// 5. 等待本轮SOC模拟退出
m_aas->wait_event(AAS_SOC_DONE);

bool passed = true;
for (int i = 0; i < vertex_num; i++) {
    if (soc_res[i] != res[i]) {
        passed = false;
        printf("Err on %d, soc res:%d, expected res:%d\\n", i, soc_res[i], res[i]);
        EXPECT_EQ(soc_res[i], res[i]);
    }
}
if (passed) {
    int freq = 150;
    printf("[Simulator]: bfs passed\\n");
    printf("[Simulator]: bfs core start clk: %d\\n", m_simulator->_core_start_clk);
    printf("[Simulator]: bfs core end clk: %d\\n", m_simulator->_core_end_clk);
    printf("[Simulator]: bfs do edge task: %d\\n", total_send_e_task);
    printf("[Simulator]: freq=%d MHz, bfs performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
    freq = 1000;
    printf("[Simulator]: freq=%d MHz, bfs performance: %f GTeps\\n", freq, _gu.bfs_performance(m_simulator->_core_end_clk - m_simulator->_core_start_clk, total_send_e_task, freq * 1000 * 1000));
} else {
    printf("[Simulator]: bfs NOT passed\\n");
}`,
      'ppr': `#include <iostream>
#include "simulator.h"
#include "graph_sdk/aas/aas.h"
#include "graph_utils.h"
#include "mm_utils.h"

extern int total_send_e_task;

#define CORE_NUM (SIMD_WIDTH)
#define MAX_V_NUM 5000000
#define MAX_SIMULATE_CYCLE 10000000000

using namespace graph_mm;

std::string off_name = dataset_dir + std::string("off_list.txt");
std::string edge_name = dataset_dir + std::string("edge_list.txt");
load_graph (edge_name.c_str(), off_name.c_str());

int iter = pr_push();

std::string pr_asm = std::string("../test/asm/testsuit/pr_push_sync_dma.asm");
std::string pr_bin = std::string("../test/asm/bin/pr_push_sync_dma.bin");
m_simulator->parse_asm_to_bin(pr_asm.c_str(), pr_bin.c_str());

m_aas->wait_event(AAS_SOC_READY);
printf("[Simulator]: SOC ready, begin to dma data\\n");

float damping = 0.85;
float e1 = 1e-2, e2 = 1e-7;
float one_over_n = 1.0 / v_num; // old delta
int* i_one_over_n = (int *)&one_over_n;
float addedConst = (1 - damping) * one_over_n; // old pr
int* i_addedConst = (int *)&addedConst;
float delta_new_ini_v = addedConst - one_over_n; // new delta
int* i_delta_new_ini_v = (int *)&delta_new_ini_v;

//int init_v[v_num] = {0}, init_new_v[v_num] = {0};
int * init_v = new int[v_num];
int * init_new_v = new int[v_num];

// 1. DMA 数据
int config[64] = {0};
config[0] = v_num;
config[1] = e_num;
config[2] = iter;

m_aas->dma_graph_data((char*)config, 0, sizeof(int)* (64));
m_aas->dma_graph_data((char*)off_list, 16 * 1024 * 1024, sizeof(int)* (v_num));
m_aas->dma_graph_data((char*)&(off_list[1]), 20 * 1024 * 1024, sizeof(int)* (v_num));
// init old_v
printf("one / v = %f, i_val: %d, delta_new_ini_v: %f, i_val:%d\\n",
    one_over_n, *i_one_over_n, delta_new_ini_v, *i_delta_new_ini_v);
for (int i = 0; i < v_num; i++) {
    init_v[i] = *i_one_over_n;
}
m_aas->dma_graph_data((char*)(init_v), 4*1024*1024, sizeof(int)* (v_num));
// init pr value
m_aas->dma_graph_data((char*)(init_v), 12*1024*1024, sizeof(int)* (v_num));
// init new_v
for (int i = 0; i < v_num; i++) {
    init_new_v[i] = *i_delta_new_ini_v;
}
m_aas->dma_graph_data((char*)(init_new_v), 8*1024*1024, sizeof(int)* (v_num));
// send edge id
m_aas->dma_graph_data((char*)(edge_list), 24*1024*1024, sizeof(int)* (e_num));


// 2. 启动计算
m_aas->start_kernel(pr_bin.c_str());

// 3. 等待计算完成
m_aas->wait_event(AAS_SOC_KERNEL_DONE);

// 4. 检测计算结果
printf("[Simulator]: copy data from lpddr to CPU ...\\n");
//float soc_res[v_num] = {0};
float * soc_res = new float[v_num];

for (int i = 0; i < v_num; i++) {
    soc_res[i] = 0;
}
/// 4.1 ASM中将结果写入lpddr的2048位置, 因此从lpddr的2048位置读取到CPU端
m_aas->dma_from_lpddr((char*)soc_res, 12*1024*1024, sizeof(int)*v_num);
printf("[Simulator]: LPDDR to CPU done, check result\\n");

m_aas->stop_core();

// 5. 等待本轮SOC模拟退出
m_aas->wait_event(AAS_SOC_DONE);

// check result
double sum_dif = 0;
double max_dif = 0;
double max_deviation = 0;
int max_deviation_id = 0;
int max_dif_id = 0;
int err_count = 0;
double sum = 0;
bool passed = true;
float * cpu_res = vertex_float_val;

for (int i = 0; i < v_num; ++ i) {
    double dif;
    sum += cpu_res[i];
    if (cpu_res[i] > *(float *)&soc_res[i]) {
        dif = cpu_res[i] - *(float *)&soc_res[i];
        max_dif_id = max_dif > dif ? max_dif_id : i;
        max_dif = max_dif > dif ? max_dif : dif;
        sum_dif += dif;
    } else {
        dif = *(float *)&soc_res[i] - cpu_res[i];
        max_dif_id = max_dif > dif ? max_dif_id : i;
        max_dif = max_dif > dif ? max_dif : dif;
        sum_dif += dif;
    }
    double deviation = 0;
    if (cpu_res[i] != 0) {
        deviation = dif / cpu_res[i];
    } else {
        deviation = dif;
    }
    max_deviation = max_deviation > deviation ? max_deviation : deviation;
    if (deviation >= 0.02) {
        cout << "i: " << i << ", deviation: " << deviation <<
        ", spm: " << *(float *)&soc_res[i] << ", test: " << cpu_res[i];
        passed = false;
    }
}
cout << "Deviation = " << sum_dif / sum << endl;
cout << "Err = " << err_count << endl;
cout << "Sum_Dif = " << sum_dif << endl;
cout << "Max_Id = " << max_dif_id << ", H_Value = " << cpu_res[max_dif_id] << ", ACC_Value = " << *(float *)&soc_res[max_dif_id] << ", Max_Dif = " << max_dif << endl;
cout << "Max_Deviation_Id = " << max_deviation_id << ", Max_Deviation = " << max_deviation << endl;

int ret = 0;
cout << "PR summary: " << endl;
if (passed) {
    cout << "Page Rank passed on dataset " << dataset_dir << endl;
} else {
    cout << "Page Rank NOT passed on dataset " << dataset_dir << endl;
    ret = -1;
}

int freq = 1000;
cout << "iter: " << iter << endl;
//cout << "freq: " << freq << " MHz" << endl;
float gteps = pr_performance(m_simulator->get_total_soc_clks(), iter * e_num, freq * 1000 * 1000);
cout << "traversed edges: " << iter * e_num << "\\ntotal cycles: " << m_simulator->get_total_soc_clks() << endl;
cout << "PR Performance: " << gteps << " GTEPs" << endl;
//cout << "Performance(include CPU DMA): " << pr_performance(m_simulator->get_total_clks(), iter * e_num, freq * 1000 * 1000) << " GTEPs" << endl;
cout << "GTEPS/W: " << gteps / m_walt << endl;

delete [] init_v;
delete [] init_new_v;
delete [] soc_res;

return ret;
`,
      'gcn': `#include <iostream>
#include "simulator.h"
#include "graph_sdk/aas/aas.h"
#include "graph_utils.h"
#include "mm_utils.h"

extern int total_send_e_task;

#define CORE_NUM (SIMD_WIDTH)
#define MAX_V_NUM 5000000
#define MAX_SIMULATE_CYCLE 10000000000

using namespace graph_mm;

std::cout << "GCN data dir: " << dataset_dir << ", x1 file: " << x1_file << std::endl;
// COO-format
std::string core_adj_file = dataset_dir + std::string("adj_coords_values.txt");
std::string core_w1_weight_file = dataset_dir + std::string("gcn_weights_W1_coords.txt");
std::string core_w2_weight_file = dataset_dir + std::string("gcn_weights_W2_coords.txt");
std::string core_X1_file = x1_file;

// checked!
SparseMatrix<float> * A = GCNUtil::LoadCooSparseMatrixWithProperty(core_adj_file, CSC_MATRIX);
Eigen::MatrixXf * W1 = GCNUtil::LoadCooDenseMatrix(core_w1_weight_file, COO_COL_MATRIX);  // get col-major matrix
Eigen::MatrixXf * W2 = GCNUtil::LoadCooDenseMatrix(core_w2_weight_file, COO_COL_MATRIX);  // get col-major matrix
SparseMatrix<float> * X1 = GCNUtil::LoadCooSparseMatrixWithProperty(core_X1_file, CSC_MATRIX);

std::cout << "A: rows=" << A->rows() << ", cols=" << A->cols() << std::endl;
std::cout << "X1: rows=" << X1->rows() << ", cols=" << X1->cols() << std::endl;
std::cout << "W1: rows=" << W1->rows() << ", cols=" << W1->cols() << std::endl;
std::cout << "W2: rows=" << W2->rows() << ", cols=" << W2->cols() << std::endl;

Eigen::MatrixXf * AXW1 = GCNUtil::GCNConv1(A, X1, W1);
Eigen::MatrixXf * X2 = GCNUtil::DenseReLU(AXW1);
Eigen::MatrixXf * AXW2 = GCNUtil::GCNConv2(A, X2, W2);
Eigen::VectorX<Eigen::Index> * pred = GCNUtil::DenseArgMax(AXW2);

std::cout << "X2: rows=" << X2->rows() << ", cols=" << X2->cols() << std::endl;
std::cout << "X3: rows=" << AXW2->rows() << ", cols=" << AXW2->cols() << std::endl;
std::cout << *AXW2 << std::endl;
std::cout << "Pred: " << std::endl;
std::cout << *pred << std::endl;

std::cout << "A nnz: " << A->getENum() << std::endl;
std::cout << "X1 nnz: " << X1->getENum() << std::endl;
std::cout << "W1 cols: " << W1->cols() << std::endl;
std::cout << "X2 nnz: " << X2->size() << std::endl;
std::cout << "W2 cols: " << W2->cols() << std::endl;

// 驱动图芯片进行计算
std::string gcn_asm = std::string("../test/asm/testsuit/gcn_push_sync_dma_big.asm");
std::string gcn_bin = std::string("../test/asm/bin/gcn_push_sync_dma_big.bin");
m_simulator->parse_asm_to_bin(gcn_asm.c_str(), gcn_bin.c_str());

// 要求：
// GCN的规模不能超过限制，N, Feature, Channels均需要小于256K个数据, 而且A, X1, X2的非零元小于1M个
// A需要是稀疏矩阵表示，非零元小于1M个
// X1需要是稀疏矩阵表示, 非零元小于1M个
// X2是稠密的(N * Channels < 1M)
//
// 实现说明:
// X2 是第一轮的结果，虽然是稠密(N rows, Channels cols)，但需要生成CSC格式
// lpddr中需要存放3个图和两个权重矩阵，A, X1, X2, 每个图需要放st, ed, edge_id, edge_val 4种数据
// 由于GCN测试的图可能小于2^18个点，因此st,ed占用内存小于1MB，因此可以按这个来组织; edge_id和edge_val均小于4MB
//      [0 4MB)               [4MB - 12MB)    [12MB - 16MB) [16MB - 18MB)      [18MB -             ]
//       config, rsv          3组st, ed          W1的值        W2的值           3组edge_id, edge_val
//
// [0 4MB)范围为预留范围, 每个数据4bytes, 包含config, old_v和new_v
// 配置信息占用[0 256B)范围，其意义如下：
// 地址: [0      4      8       12        16       20       24      28       32       36    ------------------- 256Bytes)
// 含义:  A_row, A_row, X1_row, X1_col,   W1_row,  W1_col,  X2_row, X2_col,  W2_row,  W2_col
// 值:    N      N      N       feature   feature  channel  N       channel  channel  class
// [1MB 2MB) [2MB 3MB) [3MB 4MB)
// 0         old_v     new_v(最终计算结果)

m_aas->wait_event(AAS_SOC_READY);
printf("[Simulator]: SOC ready, begin to dma data\\n");

// 1. 准备数据
#if 0
int N = 2708;
int Features = 1433;
int Channels = 32;
int Classes = 7;
#else
int N = A->rows();
int Features = W1->rows();
int Channels = W1->cols();
int Classes = W2->cols();
printf("GCN on %s, N: %d, F: %d, Channel: %d, C: %d\\n", dataset_dir.c_str(), N, Features, Channels, Classes);
#endif

int config[64] = {0};   // config一共256bytes
config[0] = N;
config[1] = N;
config[2] = N;
config[3] = Features;
config[4] = Features;
config[5] = Channels;
config[6] = N;
config[7] = Channels;
config[8] = Channels;
config[9] = Classes;

SparseMatrix<float>* X2_adj = graph_mm::GCNUtil::CreateSparseMatrixFromRowsAndCols(N, Channels, CSC_MATRIX);

// copy config
m_aas->dma_graph_data((char*)&config, 0, sizeof(int) * 64);
m_aas->dma_set_data(1 * 1024 *1024, 3 * 1024 * 1024, 0);  // 将 [1MB -> 4MB)区域置0

// A
m_aas->dma_graph_data((char*)A->getOffsetStarts(), 4 * 1024 * 1024, sizeof(int) * A->getVNum());
m_aas->dma_graph_data((char*)A->getOffsetEnds(), 5 * 1024 * 1024, sizeof(int) * A->getVNum());
m_aas->dma_graph_data((char*)A->getEdgeIds(), 18 * 1024 * 1024, sizeof(int) * A->getENum());
m_aas->dma_graph_data((char*)A->getEdgeVals(), 52 * 1024 * 1024, sizeof(int) * A->getENum());

// X1
m_aas->dma_graph_data((char*)X1->getOffsetStarts(), 6 * 1024 * 1024, sizeof(int) * X1->getVNum());
m_aas->dma_graph_data((char*)X1->getOffsetEnds(), 7 * 1024 * 1024, sizeof(int) * X1->getVNum());
m_aas->dma_graph_data((char*)X1->getEdgeIds(), 86 * 1024 * 1024, sizeof(int) * X1->getENum());
m_aas->dma_graph_data((char*)X1->getEdgeVals(), 94 * 1024 * 1024, sizeof(int) * X1->getENum());

// X2 adj
m_aas->dma_graph_data((char*)X2_adj->getOffsetStarts(), 8 * 1024 * 1024, sizeof(int) * X2_adj->getVNum());
m_aas->dma_graph_data((char*)X2_adj->getOffsetEnds(), 9 * 1024 * 1024, sizeof(int) * X2_adj->getVNum());
m_aas->dma_graph_data((char*)X2_adj->getEdgeIds(), 102 * 1024 * 1024, sizeof(int) * X2_adj->getENum());

// W1, 由于要按列的方式使用，需要W1是col-major的
m_aas->dma_graph_data((char*)W1->data(), 12 * 1024 * 1024, sizeof(int) * W1->size());

// W2, 由于要按列的方式使用，需要W2是col-major的
m_aas->dma_graph_data((char*)W2->data(), 16 * 1024 * 1024, sizeof(int) * W2->size());

// 2. 启动计算
m_aas->start_kernel(gcn_bin.c_str());

// 3. 等待计算完成
m_aas->wait_event(AAS_SOC_KERNEL_DONE);

// 4. 检测计算结果
float *soc_res = new float[N * Classes];
memset(soc_res, 0, sizeof(float) * N * Classes);
m_aas->dma_from_lpddr((char*)soc_res, 180 * 1024 * 1024, sizeof(float) * N * Classes);

/// @note 如果没有stop和等待，则由于多线程退出，会引起segment fault
m_aas->stop_core();
// 5. 等待本轮SOC模拟退出
m_aas->wait_event(AAS_SOC_DONE);

Eigen::MatrixXf *res_mat = new Eigen::MatrixXf(N, Classes);
memcpy(res_mat->data(), soc_res, sizeof(float) * N * Classes);
std::cout << "Res Mat: \\n" << *res_mat << std::endl;
Eigen::VectorX<Eigen::Index> * soc_pred = GCNUtil::DenseArgMax(res_mat);

int passed = true;
int ret = 0;
for (int i = 0; i < soc_pred->rows(); i++) {
    for (int j = 0; j < soc_pred->cols(); j++) {
        if (soc_pred->coeff(i, j) != pred->coeff(i, j)) {
            passed = false;
            printf("elem at (%d %d) result NOT right, cur: %d, exp: %d\\n",
                i, j, soc_pred->coeff(i,j), pred->coeff(i,j));
        }
    }
}
std::cout << "A nnz: " << A->getENum() << std::endl;
std::cout << "X1 nnz: " << X1->getENum() << std::endl;
std::cout << "W1 cols: " << W1->cols() << std::endl;
std::cout << "X2 nnz: " << AXW1->size() << std::endl;
std::cout << "W2 cols: " << W2->cols() << std::endl;

std::cout << "GCN summary: " << std::endl;
if (passed) {
    printf("GCN passed on %s\\n", dataset_dir.c_str());
} else {
    printf("GCN NOT passed on %s\\n", dataset_dir.c_str());
    ret = -1;
}
int total_clks = m_simulator->get_total_soc_clks();

int op = (A->getENum() * W1->cols() + X1->getENum() * W1->cols() +
        A->getENum() * W2->cols() + AXW1->size() * W2->cols()) * 2;

float gops = op * 1.0f / total_clks;
std::cout << "total OPs: " << op
    << "\\ntotal cycles: " << total_clks << "\\nGCN performance: " << gops << " GOPS" << std::endl;

std::cout << "GOPS/W: " << gops / m_walt << std::endl;

delete A;
delete W1;
delete W2;
delete X1;
delete X2;
delete AXW1;
delete AXW2;
delete pred;

delete X2_adj;
delete [] soc_res;
delete res_mat;
delete soc_pred;
return ret;
`
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
    },
    
  };