using static StaticUsedNamespace1.ClassA;
using static StaticUsedNamespace2.ClassA;
using NormalUsedNamespace;

namespace Programm
{
    class Program
    {
        static void Main()
        {
            MyMethod();
            MyMethod2();
            ClassB.MyMethod();
            ClassC.MyMethod();
        }
    }
}
