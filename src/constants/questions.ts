import { Question } from "@/types/questions";

export const mockQuestions: Question[] = [
  {
    id: 79745814,
    title: "Clang-Tidy warnings for static coroutine methods initial_suspend and final_suspend",
    votes: 0,
    answers: 1,
    views: 37,
    tags: ["c++", "clang-tidy", "c++-coroutine"],
    timeAgo: "4 hours ago",
    author: {
      id: "user-jens",
      name: "Jens",
      reputation: 417
    },
    hasAcceptedAnswer: false,
    excerpt: "Can (and maybe should) my coroutine promise class MyCoroutine::Promise have static or non-static initial_suspend and final_suspend methods?",
    content: "Can (and maybe should) my coroutine promise class `MyCoroutine::Promise` have **static** or **non-static** `initial_suspend` and `final_suspend` methods?\n\n```cpp\nstatic std::suspend_always initial_suspend() noexcept\n{\n    return {};\n}\n\nstatic std::suspend_always final_suspend() noexcept  \n{\n    return {};\n}\n```\n\nWhile this works fine (tested with GCC 13), Clang-Tidy complains \"Static member accessed through instance\", when using this coroutine type:\n\n```cpp\nMyCoroutine foo() // Clang-Tidy warning here\n{\n    co_return;\n}\n```\n\nThis makes sense because \"when a coroutine begins execution, it [...] calls `promise.initial_suspend()` \" (see [cppreference.com](https://en.cppreference.com/w/cpp/language/coroutines.html)) via instance, not via promise type.\n\nSo should I remove the `static` keyword from these methods (and make them `const`)? A `this` pointer is not required, but probably the compiler can optimize these calls, anyway. Or are static methods a good idea here and is there a better way to deal with this warning?\n\nSome of the examples from [cppreference.com](https://en.cppreference.com/w/cpp/language/coroutines.html) do have static `initial_suspend` and `final_suspend` methods, some don't.",
    contentJson: {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Can (and maybe should) my coroutine promise class "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "MyCoroutine::Promise"
            },
            {
              "type": "text",
              "text": " have "
            },
            {
              "type": "text",
              "marks": [{"type": "bold"}],
              "text": "static"
            },
            {
              "type": "text",
              "text": " or "
            },
            {
              "type": "text",
              "marks": [{"type": "bold"}],
              "text": "non-static"
            },
            {
              "type": "text",
              "text": " "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "initial_suspend"
            },
            {
              "type": "text",
              "text": " and "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "final_suspend"
            },
            {
              "type": "text",
              "text": " methods?"
            }
          ]
        },
        {
          "type": "codeBlock",
          "attrs": {"language": "cpp"},
          "content": [
            {
              "type": "text",
              "text": "static std::suspend_always initial_suspend() noexcept\n{\n    return {};\n}\n\nstatic std::suspend_always final_suspend() noexcept  \n{\n    return {};\n}"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "While this works fine (tested with GCC 13), Clang-Tidy complains \"Static member accessed through instance\", when using this coroutine type:"
            }
          ]
        },
        {
          "type": "codeBlock",
          "attrs": {"language": "cpp"},
          "content": [
            {
              "type": "text",
              "text": "MyCoroutine foo() // Clang-Tidy warning here\n{\n    co_return;\n}"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "This makes sense because \"when a coroutine begins execution, it [...] calls "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "promise.initial_suspend()"
            },
            {
              "type": "text",
              "text": " \" (see "
            },
            {
              "type": "text",
              "marks": [{"type": "link", "attrs": {"href": "https://en.cppreference.com/w/cpp/language/coroutines.html"}}],
              "text": "cppreference.com"
            },
            {
              "type": "text",
              "text": ") via instance, not via promise type."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "So should I remove the "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "static"
            },
            {
              "type": "text",
              "text": " keyword from these methods (and make them "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "const"
            },
            {
              "type": "text",
              "text": ")? A "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "this"
            },
            {
              "type": "text",
              "text": " pointer is not required, but probably the compiler can optimize these calls, anyway. Or are static methods a good idea here and is there a better way to deal with this warning?"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Some of the examples from "
            },
            {
              "type": "text",
              "marks": [{"type": "link", "attrs": {"href": "https://en.cppreference.com/w/cpp/language/coroutines.html"}}],
              "text": "cppreference.com"
            },
            {
              "type": "text",
              "text": " do have static "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "initial_suspend"
            },
            {
              "type": "text",
              "text": " and "
            },
            {
              "type": "text",
              "marks": [{"type": "code"}],
              "text": "final_suspend"
            },
            {
              "type": "text",
              "text": " methods, some don't."
            }
          ]
        }
      ]
    },
    comments: [
      {
        id: 1,
        content: "Another observation is that you don't need to sort the array, but you just need to partition it with the value `128`. Sorting is **O(n*log(n))**, whereas partitioning is just linear. Basically it is just one run of the quick sort partitioning step with the pivot chosen to be 128.",
        author: { name: "Simon Hrabec", reputation: 373000 },
        timeAgo: "May 11, 2018 at 12:45"
      },
      {
        id: 2,
        content: "@screwnut here's an experiment which would show that partitioning is sufficient: create an unsorted but partitioned array with otherwise random contents. Measure time. Sort it. Measure time again.",
        author: { name: "Jonas Kölker", reputation: 67000 },
        timeAgo: "Oct 5, 2020 at 8:26"
      },
      {
        id: 3,
        content: "Btw. on Apple M1 the code runs in 17 sec unsorted, and in 7 sec sorted, so the branch prediction penalty isn't that bad on risc architecture.",
        author: { name: "Piotr Czapla", reputation: 31000 },
        timeAgo: "Mar 31, 2021 at 9:07"
      },
      {
        id: 4,
        content: "@RomanYavorskyi: It depends on the compiler. If they make branchless asm for this specific test (e.g. as part of vectorizing with SIMD like in [this question](https://stackoverflow.com/questions/example)), or just with scalar `cmov` ([gcc optimization flag](https://stackoverflow.com/questions/example)), then sorted or not doesn't matter.",
        author: { name: "Peter Cordes", reputation: 373000 },
        timeAgo: "Apr 15, 2021 at 6:31"
      },
      {
        id: 5,
        content: "@screwnut: To be fair, though, it still wouldn't be worth partitioning first, because partitioning requires conditional copying or swapping based on the same `array[i] > 128` compare.",
        author: { name: "Peter Cordes", reputation: 373000 },
        timeAgo: "Apr 15, 2021 at 6:46"
      },
      {
        id: 6,
        content: "The optimization you're looking for is called **auto-vectorization**. Most modern compilers can detect simple loops like this and convert them to SIMD instructions automatically.",
        author: { name: "Mike Chen", reputation: 12500 },
        timeAgo: "2 hours ago"
      },
      {
        id: 7,
        content: "Have you tried compiling with `-O3` flag? That usually enables more aggressive optimizations including branch prediction improvements.",
        author: { name: "Sarah Johnson", reputation: 8900 },
        timeAgo: "1 hour ago"
      }
    ],
    answers_data: [
      {
        id: 1,
        votes: 0,
        content: "Making them `static` would change nothing meaningful about the program. Non-`static`, non-`virtual` members don't have any inherent limitations to compiler-based optimizations compared to `static` ones. If the function definitions are in the header/module interface, then the compiler can inline them or otherwise do definition-based optimizations regardless of whether they're `static` or not.",
        contentJson: {
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Making them "
                },
                {
                  "type": "text",
                  "marks": [{"type": "code"}],
                  "text": "static"
                },
                {
                  "type": "text",
                  "text": " would change nothing meaningful about the program. Non-"
                },
                {
                  "type": "text",
                  "marks": [{"type": "code"}],
                  "text": "static"
                },
                {
                  "type": "text",
                  "text": ", non-"
                },
                {
                  "type": "text",
                  "marks": [{"type": "code"}],
                  "text": "virtual"
                },
                {
                  "type": "text",
                  "text": " members don't have any inherent limitations to compiler-based optimizations compared to "
                },
                {
                  "type": "text",
                  "marks": [{"type": "code"}],
                  "text": "static"
                },
                {
                  "type": "text",
                  "text": " ones. If the function definitions are in the header/module interface, then the compiler can inline them or otherwise do definition-based optimizations regardless of whether they're "
                },
                {
                  "type": "text",
                  "marks": [{"type": "code"}],
                  "text": "static"
                },
                {
                  "type": "text",
                  "text": " or not."
                }
              ]
            }
          ]
        },
        author: {
          name: "Nicol Bolas",
          reputation: 479000
        },
        timeAgo: "2 hours ago",
        isAccepted: false,
        comments: [
          {
            id: 11,
            content: "This is a great explanation! I was wondering about the same thing. Does this apply to all member functions or just specific cases like coroutines?",
            author: { name: "DevUser123", reputation: 1500 },
            timeAgo: "1 hour ago"
          },
          {
            id: 12,
            content: "Just to add: the **key insight** is that modern compilers are very good at optimization. The `static` keyword here is more about code organization than performance.",
            author: { name: "CodeExpert", reputation: 25000 },
            timeAgo: "45 minutes ago"
          }
        ]
      }
    ]
  },
  {
    id: 1,
    title: "Ignore metadata attributes in AsciiDoc with Vale",
    votes: 0,
    answers: 0,
    views: 2,
    tags: ["static-analysis", "asciidoc"],
    timeAgo: "48 secs ago",
    author: {
      id: "user-arie",
      name: "arie",
      reputation: 852
    },
    excerpt: "I have AsciiDoc files with the following header: = Title :description: My page description. :key-words: keyword 1,keyword 2,keyword 3 I would like Vale to ignore the line starting with :keyword..."
  },
  {
    id: 99999,
    title: "How can I remove a specific item from an array in JavaScript?",
    votes: 12210,
    answers: 50,
    views: 135000000,
    tags: ["javascript", "arrays"],
    timeAgo: "Apr 23, 2011",
    author: {
      id: "user-walker",
      name: "Walker",
      reputation: 135000
    },
    hasAcceptedAnswer: true,
    excerpt: "How do I remove a specific value from an array? Something like: array.remove(value); Constraints: I have to use core JavaScript. Frameworks are not allowed."
  },
  {
    id: 88888,
    title: "How do I check if an element is hidden in jQuery?",
    votes: 8740,
    answers: 67,
    views: 330000,
    tags: ["javascript", "jquery", "dom", "visibility"],
    timeAgo: "Oct 7, 2008",
    author: {
      id: "user-philip",
      name: "Philip Morton",
      reputation: 132000
    },
    hasAcceptedAnswer: true,
    excerpt: "How do I toggle the visibility of an element using .hide(), .show(), or .toggle()? How would I test if an element is visible or hidden?"
  },
  {
    id: 2,
    title: "Parameter 0 of method entityManagerFactory in PrimaryDataSourceConfig required a bean of type EntityManagerFactoryBuilder that could not be found",
    votes: 0,
    answers: 0,
    views: 7,
    tags: ["java", "postgresql", "spring-boot", "backend"],
    timeAgo: "6 mins ago",
    author: {
      id: "user-miraj",
      name: "Miraj Hossain Shawon",
      reputation: 35
    },
    excerpt: "I am trying to configure 2 databases in a single spring boot application.So that i have configured 2 separate Config files for postgres and postgres vector db. @Configuration @..."
  },
  {
    id: 3,
    title: "webpack aliasing fails in NextJS + ts app",
    votes: 0,
    answers: 0,
    views: 6,
    tags: ["reactjs", "typescript", "next.js", "webpack"],
    timeAgo: "7 mins ago",
    author: {
      id: "user-anwar",
      name: "anwar",
      reputation: 428
    },
    excerpt: "While working on a modular Next.js-13 app, I ran into one persistent challenge: plugin-based component overrides. The Setup We structured the app like this: /components/singleNews..."
  },
  {
    id: 4,
    title: "Backward and forward compatibility issues with protobufs in Google Pub/Sub",
    votes: 0,
    answers: 0,
    views: 10,
    tags: ["enums", "protocol-buffers", "google-cloud-pubsub"],
    timeAgo: "17 mins ago",
    author: {
      id: "user-mike",
      name: "Mike Williamson",
      reputation: 3456
    },
    excerpt: "We use protocol buffers both for gRPC server-to-server communication and for publishing messages to Pub/Sub. Pub/Sub is fairly sensitive to schema changes, not allowing any schema..."
  },
  {
    id: 5,
    title: "PyQt6 - How can I change the direction of the scale/ruler",
    votes: 0,
    answers: 0,
    views: 10,
    tags: ["python", "pyqt6"],
    timeAgo: "22 mins ago",
    author: {
      id: "user-123",
      name: "user123",
      reputation: 156
    },
    bountyAmount: 50,
    excerpt: "I'm working on a PyQt6 application where I need to create a custom scale/ruler widget. Currently, I have a horizontal scale, but I want to change its direction..."
  }
];
