cmake_minimum_required(VERSION 3.16)
project(VaaniSetu_Firmware)

# Minimal CMake structure for STM32 ARM Cortex-M4
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

include_directories(Core/Inc)

file(GLOB SOURCES "Core/Src/*.c" "Core/audio/*.c" "Core/ai/*.c" "Core/knowledge/*.c")

add_executable(${PROJECT_NAME}.elf ${SOURCES})

# To be compiled with arm-none-eabi-gcc
