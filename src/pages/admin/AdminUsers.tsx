import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Edit, Loader2, Trash2, AlertTriangle, Upload, Users, LayoutGrid, List, Download, Crown, IndianRupee, FileSpreadsheet, FileUp, UserPlus, UserMinus, GraduationCap } from 'lucide-react';
import {
  useMentorRoleSet,
  useGrantMentorRole,
  useRevokeMentorRole,
  useBulkGrantMentorRole,
  useUpdateMentorCapacity,
} from '@/hooks/useMentorAdminData';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { errMessage } from '@/lib/errMessage';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Edition = Database['public']['Tables']['editions']['Row'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

// Edition 14 Filmmaking Goa Students
const EDITION_14_STUDENTS = [
  { full_name: "Ashish Maske", email: "ashish.maske89@gmail.com", phone: "9561317768" },
  { full_name: "Mukul Das", email: "mukuldas77@gmail.com", phone: "8553849837" },
  { full_name: "Karthik Rengasamy", email: "karthik.rengasamy.work@gmail.com", phone: "919944647016" },
  { full_name: "Sandeep Kumar H", email: "sandukumarh@gmail.com", phone: "918860476865" },
  { full_name: "Balgopal Hota", email: "balgopalh@gmail.com", phone: "917749041226" },
  { full_name: "Krishna Dev Sharma", email: "kd6279@gmail.com", phone: "919810244550" },
  { full_name: "Rajeshkumar Bachu", email: "rajk.bachu@gmail.com", phone: "7989256200" },
  { full_name: "Srikanth Dangetti", email: "srikanthdangeti@gmail.com", phone: "919573800042" },
  { full_name: "Kabishek", email: "ka.ek2121@gmail.com", phone: "6383197396" },
  { full_name: "Sushant Sinha", email: "writetosushantsinha@gmail.com", phone: "9665142117" },
  { full_name: "Praveen Choudari", email: "praveenbchoudari@gmail.com", phone: "7019809364" },
  { full_name: "Milee Patel", email: "patelmilee903@gmail.com", phone: "8849998216" },
  { full_name: "Anunay Gupta", email: "anunayg2001@gmail.com", phone: "8318674416" },
  { full_name: "Sourav Saha", email: "souravsaha.here@gmail.com", phone: "6297876090" },
  { full_name: "Sandeep Pradhan", email: "drsandyscbaiims@gmail.com", phone: "7978134375" },
  { full_name: "Kalyan Chakravarthy", email: "chakravarthy.ca@gmail.com", phone: "9962579968" },
  { full_name: "Anshul Karasi", email: "anshulkarasi009@gmail.com", phone: "7406654816" },
  { full_name: "Omkar Devane", email: "omkardevane@gmail.com", phone: "9167957262" },
  { full_name: "Kishore", email: "kishor.ramakrishna@gmail.com", phone: "31628051304" },
  { full_name: "Ranjeeth", email: "branjeeth97@gmail.com", phone: "8867523877" },
  { full_name: "Vineeth Reddy", email: "vineethreddy.vakiti@gmail.com", phone: "9550046000" },
  { full_name: "Raj Vudali", email: "raj.vudali@gmail.com", phone: "9731000795" },
  { full_name: "Aniket Dolas", email: "aniketdolas424@gmail.com", phone: "7620971766" },
  { full_name: "Nandipati Adi Siva Sai Kartheek", email: "kartheek.0774@gmail.com", phone: "8247702956" },
];

const EDITION_14_ID = "1b9e4712-1965-47ef-9fb5-dfb1beaf7e54";

// Edition 15 Filmmaking Goa Students
const EDITION_15_STUDENTS = [
  { full_name: "Nilesh Dattatray Shinde", email: "nileshshinde2301106@gmail.com", phone: "7385290178" },
  { full_name: "Jay Arora", email: "jayaroranyc@gmail.com", phone: "9870499422" },
  { full_name: "Swati Jain", email: "swatzain@yahoo.com", phone: "9845116683" },
  { full_name: "Jay", email: "jaisimha078@gmail.com", phone: "8639529860" },
  { full_name: "Vaibhav Kammar", email: "vaibhav.but.filmmaking@gmail.com", phone: "8147646756" },
  { full_name: "Rajnikant Revabhai Parmar", email: "rjparmar09@gmail.com", phone: "14164736585" },
  { full_name: "Jayanth Moharier", email: "moherier.jayanth@gmail.com", phone: "12674371621" },
  { full_name: "Imran Khan", email: "aceik346@gmail.com", phone: "9845920258" },
  { full_name: "Asishey Uranw", email: "at7050791@gmail.com", phone: "6299706776" },
  { full_name: "Krunal Pandya", email: "mr.krunalpandya@gmail.com", phone: "8980701011" },
  { full_name: "Manoj Kinger", email: "manoj.kinger@outlook.com", phone: "9971369702" },
  { full_name: "Ravi Singh", email: "mithepurfarms@gmail.com", phone: "9873832002" },
  { full_name: "Anil Kumar Bhaskar", email: "anil.bhaskar9899@gmail.com", phone: "9871920726" },
  { full_name: "V Sai Rithik Reddy", email: "rithikreddy247@gmail.com", phone: "9989097237" },
  { full_name: "Pramod Kumar", email: "pramod0511kumar@gmail.com", phone: "9980614869" },
  { full_name: "Sockalingam", email: "socklin91096@gmail.com", phone: "7397779870" },
  { full_name: "Ruthvik Veera", email: "ww.ruthvik@gmail.com", phone: "9502624969" },
  { full_name: "Asit Aanand", email: "asitaanand10887@gmail.com", phone: "8175903388" },
  { full_name: "Ajinkya Sambhare", email: "ajinkyasambhare2411@gmail.com", phone: "9175356723" },
  { full_name: "Adarsh Ranjan Jha", email: "adarshrjha@gmail.com", phone: "918851733625" },
  { full_name: "Ashik Salim", email: "ashik6@gmail.com", phone: "919746575743" },
  { full_name: "Kanan Bahl", email: "kananbahl@gmail.com", phone: "9205742633" },
  { full_name: "Anirudh G S", email: "gsanirudh123@gmail.com", phone: "9019145543" },
  { full_name: "Ravi Kiran", email: "bychancebychoice@gmail.com", phone: "9866094144" },
];

const EDITION_15_ID = "ec048e00-421e-4ceb-bcc0-df675173b296";

// Creators Edition 1 Bali Students
const CREATORS_E1_STUDENTS = [
  { full_name: "Vanmathi", email: "vanmathi@uvagro.com", phone: "919442921029" },
  { full_name: "Varsha", email: "varsha.babani@gmail.com", phone: "919892873704" },
  { full_name: "Arush Thapar", email: "arush@brandingpioneers.com", phone: "919789565515" },
  { full_name: "Siddharth", email: "sid.balhara1694@gmail.com", phone: "917290051900" },
  { full_name: "Naveen Nagdaune", email: "nnnaveenhot7@gmail.com", phone: "919522222521" },
  { full_name: "Pankaj Kumar", email: "forpankaj.prasar@gmail.com", phone: "9074451965" },
  { full_name: "Mohammad Kashif", email: "kashif170017@gmail.com", phone: "918273336161" },
  { full_name: "Manoj", email: "manoj.pothani@gmail.com", phone: "919700987224" },
  { full_name: "Shoaib", email: "shoaibmustaque10@gmail.com", phone: "7980978482" },
  { full_name: "Sajitha", email: "sajidashaje@gmail.com", phone: "8921587407" }
];

const CREATORS_E1_ID = "da818745-0904-41b6-8182-3a338265dd68";

// Creators Edition 2 Goa Students
const CREATORS_E2_GOA_STUDENTS = [
  { full_name: "Suryanarayanan", email: "surya.ckv@gmail.com", phone: "9884461009" },
  { full_name: "Reema Abbas", email: "reema.abbas0786@gmail.com", phone: "7042745425" },
  { full_name: "Prashan Saraf", email: "saraf.prashant72@gmail.com", phone: "9820065475" },
  { full_name: "Rohit Alluri", email: "rohit@leamss.com", phone: "7718882427" },
  { full_name: "Shivain Sacheti", email: "sachetishivain97@gmail.com", phone: "9079120024" },
  { full_name: "Vinita Tanwani", email: "vinitaatanwani@gmail.com", phone: "9901307135" },
  { full_name: "Parmeet Singh Chadha", email: "parmeet.wscc@gmail.com", phone: "7699000007" },
  { full_name: "Dr.Karthik Balaji", email: "ubkdental@gmail.com", phone: "919444418307" },
  { full_name: "Mohit Vyas", email: "mohitvyas009@gmail.com", phone: "919660570463" },
  { full_name: "Vinod", email: "vinod.morya@bytesigma.com", phone: "919971034666" },
  { full_name: "Ramesh", email: "ramesh@safestorage.in", phone: "9686566697" },
  { full_name: "Raghul Ravi", email: "raghulravidx@gmail.com", phone: "9150175026" },
  { full_name: "Sathimaa", email: "we.are.sacredbody@gmail.com", phone: "918792689234" },
  { full_name: "Nishit Badaya", email: "nishitbadaya18@gmail.com", phone: "916378311154" },
  { full_name: "Jagruti Shinde", email: "jagruti.c.shinde@gmail.com", phone: "7038524008" },
  { full_name: "Madhav Bairathi", email: "madhav.bairathi@gmail.com", phone: "919079269035" }
];

const CREATORS_E2_GOA_ID = "995324e9-5a14-4d36-8c99-fec40fd35d70";

// Writing Edition 5 Goa Students
const WRITING_E5_STUDENTS = [
  { full_name: "Rupashri", email: "yrupashri@gmail.com", phone: "7619673337" },
  { full_name: "Yoagandran AR", email: "yogu@kuviyam.co", phone: "9003786755" },
  { full_name: "Kynan D'Souza", email: "kynan.dsouza@gmail.com", phone: "9886775295" },
  { full_name: "Tanvi Vedak", email: "tanvi.vedak45@gmail.com", phone: "9022131111" },
  { full_name: "Harish R Soundararajan", email: "harish.rsoundar@gmail.com", phone: "919843844448" },
  { full_name: "Rohan Panwala", email: "rohanpanwala@yahoo.co.in", phone: "9824386807" },
  { full_name: "Aishwarya Girnekar", email: "aishwaryagirnekar06@gmail.com", phone: "8779837419" },
  { full_name: "Pranay Dhongade", email: "pranayd786@gmail.com", phone: "9004008494" },
  { full_name: "Khushboo Hanjura", email: "khushboo.hanjura@gmail.com", phone: "8130723742" },
  { full_name: "Harish dachepalli", email: "dachepalli.harish@gmail.com", phone: "9885603639" },
  { full_name: "Rakesh Kapoor", email: "itsrakeshkapoor1704@gmail.com", phone: "919581023378" },
  { full_name: "Anantha Eashwar V M", email: "eashwaranand@yahoo.in", phone: "9094040366" },
  { full_name: "Uday Jain", email: "udayvandana983@gmail.com", phone: "8630270233" },
  { full_name: "Ansath Thendral", email: "Ansathcivil786@gmail.com", phone: "9942452906" },
  { full_name: "Gunjan Katyal", email: "theblissfromwithin@gmail.com", phone: "9911273555" },
  { full_name: "Chandu Shri Vaishnav", email: "dvcsv96@gmail.com", phone: "9555760612" },
  { full_name: "Sudhansu Ranjan", email: "Ranjansudhansu844@gmail.com", phone: "917004630336" },
  { full_name: "Pallavi Minnaganti", email: "pallaviminnaganti@gmail.com", phone: "6302176475" },
  { full_name: "Abhinav Bainslay", email: "ads1734@gmail.com", phone: "9999804907" },
  { full_name: "Abdul Muqeet", email: "foodpedigry@gmail.com", phone: "6005398531" },
  { full_name: "Rajashree Gupta", email: "rajashreegupta2021@gmail.com", phone: "7428190596" },
  { full_name: "Aaditya Vundamati", email: "aditya.vundamati@gmail.com", phone: "7032821128" },
  { full_name: "Anurag Challapalli", email: "anuragchallapalli@gmail.com", phone: "9700123092" },
  { full_name: "Rachit Sharma", email: "rs220195@gmail.com", phone: "8810598242" },
  { full_name: "Nelabhra Borah", email: "neelcreates@gmail.com", phone: "8131982954" },
  { full_name: "Pratik", email: "pratiksanghar44@gmail.com", phone: "9725983249" },
  { full_name: "Aarya Jadhav", email: "aarya.ete@gmail.com", phone: "9321013185" }
];

const WRITING_E5_ID = "cf2b9fd2-a3da-4d0b-8370-da0937f9d786";

// Writing Edition 4 Goa Students
const WRITING_E4_STUDENTS = [
  { full_name: "Tanvi Vedak", email: "tanvi.vedak45@gmail.com", phone: "9022131111" },
  { full_name: "Rohan Panwala", email: "rohanpanwala@yahoo.co.in", phone: "9824386807" },
  { full_name: "Manaswini Jois", email: "manaswinijois@gmail.com", phone: "919916081944" },
  { full_name: "Pranay Dhongade", email: "pranayd786@gmail.com", phone: "9004008494" },
  { full_name: "Rakesh Kapoor", email: "itsrakeshkapoor1704@gmail.com", phone: "919581023378" },
  { full_name: "Anantha Eashwar V M", email: "eashwaranand@yahoo.in", phone: "9094040366" },
  { full_name: "Ansath Thendral", email: "Ansathcivil786@gmail.com", phone: "919942452906" },
  { full_name: "Neeraj Kumari", email: "neerajrani124@gmail.com", phone: "8287323516" },
  { full_name: "Chandrama Majumdar", email: "chandrama031@gmail.com", phone: "919820467569" },
  { full_name: "Gunjan Katyal", email: "theblissfromwithin@gmail.com", phone: "919911273555" },
  { full_name: "Sudhansu Ranjan", email: "Ranjansudhansu844@gmail.com", phone: "917004630336" },
  { full_name: "Aditya", email: "aditya.vundamati@gmail.com", phone: "7032821128" },
  { full_name: "Abdul Muqeet najar", email: "Foodpedegry761@gmail.com", phone: "6005398531" },
  { full_name: "Anurag Challapalli", email: "anuragchallapalli@gmail.com", phone: "919700123092" },
  { full_name: "Abhinav Bainslay", email: "ads1734@gmail.com", phone: "919999804907" },
  { full_name: "Nelabhra Borah", email: "neelcreates@gmail.com", phone: "8131982954" },
  { full_name: "Pratik", email: "pratiksanghar44@gmail.com", phone: "9725983249" },
  { full_name: "Aarya Jadhav", email: "aarya.ete@gmail.com", phone: "9321013185" },
  { full_name: "Rachit Sharma", email: "rs220195@gmail.com", phone: "8810598242" },
  { full_name: "Sri Narayan Prakash", email: "srinarayanprakash@gmail.com", phone: "919844462378" },
  { full_name: "Khushboo Hanjura", email: "khushboo.hanjura@gmail.com", phone: "8130723742" },
  { full_name: "Teja Nemani", email: "mail.tejanemani@gmail.com", phone: "7036733393" },
  { full_name: "Tuheena Sharma", email: "tuhinawellness@gmail.com", phone: "8054799156" },
  { full_name: "Rakshika chauhan", email: "rakshik.c09@gmail.com", phone: "9971069267" }
];

const WRITING_E4_ID = "9a4b17e1-3d5c-4f9d-9e21-2ac694bc196c";

// Edition 16/17 Filmmaking Students (from spreadsheet import)
const EDITION_16_ID = "cafb3143-964b-42e8-a8d1-80ee1da86827";
const EDITION_17_ID = "fada9b20-b56e-4d8e-b67c-7c2313e7ed9e";

// Legend: edition_id = null → Waitlisted (paid but no cohort yet)
//         EDITION_16_ID / EDITION_17_ID → assigned to that cohort
const EDITION_16_17_STUDENTS = [
  // ── Edition 16 ──────────────────────────────────────────────────────────
  { full_name: "Aryan Pratap Srivastava", email: "aryanpsrivastava@gmail.com", phone: "8861609993", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Sunny Bagde", email: "sunny.bagde.scholar@gmail.com", phone: "8459575725", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Suraj Kumar", email: "suraj.kr2317@gmail.com", phone: "919903077955", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Bindu", email: "reddysbindu@gmail.com", phone: "9930937174", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Anshul Karasi", email: "anshulkarasi009@gmail.com", phone: "7406654816", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Mukul Das", email: "mukuldas77@gmail.com", phone: "8553849837", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Akash Sky Sebastian", email: "akash.sebastian@gmail.com", phone: "8291212948", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Hrithik Sharma", email: "hrithik.sh28@gmail.com", phone: "9960471659", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Lakhinana Sai Gowtham", email: "gowthamlakhinana99@gmail.com", phone: "9515631049", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Nivas", email: "nvsneo@gmail.com", phone: "7840022308", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Priyadarshan TC", email: "priyadarshanlaltc@gmail.com", phone: "919447739577", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Princeton Lewis", email: "lewisprincejr@gmail.com", phone: "9686034462", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Sreekesh Reddy Madadi", email: "sreekeshreddymadadi@gmail.com", phone: "14702330907", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },
  { full_name: "Siddhardha S", email: "surojusiddhardha@gmail.com", phone: "8106220035", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: EDITION_16_ID },
  { full_name: "Aryan Matta", email: "aryan.ceo@gsfmoney.org", phone: "7033445558", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: EDITION_16_ID },
  { full_name: "Baasit Ali Marjaan", email: "aliquadri007@gmail.com", phone: "8657078017", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/T0kUgAOh", balance_due: 65000, edition_id: EDITION_16_ID },
  { full_name: "Ketan Gupta", email: "ketan@movedproduction.com", phone: "9148765836", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: EDITION_16_ID },
  { full_name: "Rabindra Sah", email: "rsah9118@gmail.com", phone: "917488173678", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/T0kUgAOh", balance_due: 65000, edition_id: EDITION_16_ID },
  { full_name: "Sanchi Shah", email: "sanchi.shah.04.25@gmail.com", phone: "9321569311", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_16_ID },

  // ── Edition 17 ──────────────────────────────────────────────────────────
  { full_name: "Pramod Pandith N", email: "pramodpandith007@gmail.com", phone: "6362077643", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Narendra N", email: "naren2047@gmail.com", phone: "9334457099", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Nasar Muhammed Nabeel", email: "nasarrmuhammed@gmail.com", phone: "9344965017", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Ekansh Nair", email: "shalinkunar26@gmail.com", phone: "8296807809", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Umeshlor Nungpibam", email: "umenunglpam@gmail.com", phone: "8160816221", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Krishna Mohan", email: "iamkmc7@gmail.com", phone: "9197539887296", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Abhishake De Sarkar", email: "admin@advancevantubio.com", phone: "9191636349", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Mulugu Sai", email: "mulugusai@gmail.com", phone: "9163008145", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Nitesh Chouhan", email: "chouhannitesh01@gmail.com", phone: "9195165993", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Karthik Kiran Nadigam", email: "nandigarna@gmail.com", phone: "7990003073", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Namita Patel", email: "namitapatel0811@gmail.com", phone: "9150013499", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Satish Chauhan", email: "wamfees2007@gmail.com", phone: "9198845217", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Vian Jain", email: "vianjain@gmail.com", phone: "9199981995", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Nilesh Yadav", email: "nileshyadav68664511@gmail.com", phone: "7631835412", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Suket Anand", email: "suketanand2198@gmail.com", phone: "9197070858", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },
  { full_name: "Shiva Kondapalli", email: "1993.ksk@gmail.com", phone: "9133902223", payment_status: "CONFIRMED_15K" as const, payment_link: null, balance_due: null, edition_id: EDITION_17_ID },

  // ── Waitlisted (paid but no cohort assigned yet) ─────────────────────────
  { full_name: "Aadish Kadam", email: "aadish1304@gmail.com", phone: "8951117911", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: null },
  { full_name: "Girish Reddy Veluru", email: "girishreddy.veluru@gmail.com", phone: "9703106944", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
  { full_name: "Sanjeev", email: "sanjeevmattoo@gmail.com", phone: "6304871155", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/T0kUgAOh", balance_due: 65000, edition_id: null },
  { full_name: "Laxmi Bhushan Jha", email: "laxmibhushan@gmail.com", phone: "9968666669", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
  { full_name: "Durugu Vijay Kumar", email: "drykdvizag@gmail.com", phone: "9550736196", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/T0kUgAOh", balance_due: 65000, edition_id: null },
  { full_name: "Rajesh", email: "rajeshmishra.og@gmail.com", phone: "410882258", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
  { full_name: "Pavan Subhash RaoMaddula", email: "pavankirkliston@gmail.com", phone: "447484755666", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
  { full_name: "Madhukar", email: "madhukar.tbps@gmail.com", phone: "9945060174", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
  { full_name: "Bharadwaj Indrala", email: "bharadwaj.indrala7@gmail.com", phone: "15157104706", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: null },
  { full_name: "Sheshank Naldhega", email: "sheshank23adithya@gmail.com", phone: "8247765639", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
  { full_name: "Raj Vudali", email: "raj.vudali@gmail.com", phone: "9731000795", payment_status: "BALANCE_PAID" as const, payment_link: null, balance_due: null, edition_id: null },
  { full_name: "Manoj Kinger", email: "manoj.kinger@outlook.com", phone: "9971369702", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/T0kUgAOh", balance_due: 65000, edition_id: null },
  { full_name: "Marutie PV", email: "pvmarutie@gmail.com", phone: "9008573737", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
  { full_name: "Goda Prabhakar", email: "godaprabhu@gmail.com", phone: "7327093222", payment_status: "CONFIRMED_15K" as const, payment_link: "https://rzp.io/rzp/lqegb1u", balance_due: 70000, edition_id: null },
];

// Cohort Card Component
function CohortCard({
  edition,
  userCount,
  onSelect,
  isSelected,
  variant = 'default',
}: {
  edition: Edition | null;
  userCount: number;
  onSelect: () => void;
  isSelected: boolean;
  variant?: 'default' | 'waitlist';
}) {
  const cohortTypeColors: Record<string, string> = {
    'FORGE': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'FORGE_WRITING': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'FORGE_CREATORS': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-forge-gold/50 hover:shadow-lg ${
        isSelected ? 'border-forge-gold ring-2 ring-forge-gold/30' :
        variant === 'waitlist' ? 'border-amber-500/50 border-dashed' : 'border-border/50'
      } ${edition?.is_archived ? 'opacity-60' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {edition ? (
            <Badge variant="outline" className={cohortTypeColors[edition.cohort_type] || ''}>
              {edition.cohort_type.replace('FORGE_', '').replace('FORGE', 'FILMMAKING')}
            </Badge>
          ) : variant === 'waitlist' ? (
            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              WAITLISTED
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted/50">NO EDITION</Badge>
          )}
          {edition?.is_archived && (
            <Badge variant="secondary" className="text-xs">Archived</Badge>
          )}
        </div>
        <CardTitle className="text-base line-clamp-2">
          {edition?.name || (variant === 'waitlist' ? 'Waitlisted Students' : 'Unassigned Users')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{userCount}</span>
          <span className="text-muted-foreground text-sm">students</span>
        </div>
      </CardContent>
    </Card>
  );
}


export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('action') === 'create');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cohort'>('list');
  const [selectedEditionFilter, setSelectedEditionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'admin-accounts'>('users');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState<Profile[]>([]);
  const [adminSearchLoading, setAdminSearchLoading] = useState(false);
  const [adminSearchError, setAdminSearchError] = useState<string | null>(null);
  // Bulk CSV import state
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportEditionId, setBulkImportEditionId] = useState<string>('none');
  const [bulkImportCity, setBulkImportCity] = useState('Goa');
  const [bulkImportCsv, setBulkImportCsv] = useState('');
  const [bulkImportResults, setBulkImportResults] = useState<null | { created: number; reset: number; failed: number; errors: { name: string; error: string }[] }>(null);
  const queryClient = useQueryClient();

  // Fetch users (exclude admins — they appear only in the Admin Accounts tab)
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('is_admin.is.null,is_admin.eq.false')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Fetch all admin users for the Admin Accounts tab
  const { data: adminUsers, isLoading: adminUsersLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', true)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Fetch ALL editions for cohort view (including archived)
  const { data: allEditions } = useQuery({
    queryKey: ['editions-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .order('forge_start_date', { ascending: false });
      if (error) throw error;
      return data as Edition[];
    }
  });

  // Fetch active editions for dropdown (exclude archived)
  const { data: editions } = useQuery({
    queryKey: ['editions-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('is_archived', false)
        .order('forge_start_date', { ascending: true });
      if (error) throw error;
      return data as Edition[];
    }
  });

  // Calculate user counts per edition
  const editionUserCounts = useMemo(() => {
    if (!users || !allEditions) return new Map<string | null, number>();
    
    const counts = new Map<string | null, number>();
    counts.set(null, 0); // For unassigned users
    
    allEditions.forEach(edition => counts.set(edition.id, 0));
    
    users.forEach(user => {
      const currentCount = counts.get(user.edition_id) || 0;
      counts.set(user.edition_id, currentCount + 1);
    });
    
    return counts;
  }, [users, allEditions]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      full_name: string;
      phone?: string;
      city?: string;
      edition_id?: string;
      specialty?: string;
      payment_status: PaymentStatus;
      // Mentor branch: when isMentor is true, the cohort / payment fields
      // are ignored after creation and the user is promoted to mentor.
      isMentor?: boolean;
      mentorCapacity?: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { isMentor, mentorCapacity, ...payload } = userData;

      const response = await supabase.functions.invoke('create-user', {
        body: payload,
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);

      // Mentor follow-up: grant the role + detach the new account from
      // any student-lifecycle fields the edge function defaulted to.
      if (isMentor) {
        const newUserId = response.data?.user_id as string | undefined;
        if (!newUserId) {
          throw new Error("create-user didn't return a user_id");
        }
        try {
          await grantMentorRole.mutateAsync({
            userId: newUserId,
            capacity: mentorCapacity ?? 5,
          });
        } catch (e) {
          throw new Error(`User created but mentor role failed: ${errMessage(e)}`);
        }
        // Detach from student lifecycle. Failure here is non-fatal; admin
        // can clean up via the user editor.
        const { error: detachErr } = await supabase
          .from('profiles')
          .update({
            edition_id: null,
            payment_status: null,
            unlock_level: null,
          })
          .eq('id', newUserId);
        if (detachErr) console.warn('Could not detach mentor from cohort fields', detachErr);
      }

      return response.data;
    },
    onSuccess: (_data, vars) => {
      toast.success(
        vars.isMentor ? 'Mentor created' : 'User created successfully',
      );
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentor-role-set'] });
      setIsCreateOpen(false);
      setSearchParams({});
    },
    onError: (error: Error) => {
      toast.error(errMessage(error));
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      // Update unlock_level based on payment_status
      const unlock_level = updates.payment_status === 'BALANCE_PAID' ? 'FULL' as const : 'PREVIEW' as const;
      const updateData = {
        ...updates,
        unlock_level
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('bulk-delete-users', {
        body: { user_ids: userIds }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data as { deleted: number; failed: number; errors: { email: string; error: string }[] };
    },
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} users${data.failed > 0 ? `, ${data.failed} failed` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowBulkDeleteConfirm(false);
      setSelectedUserIds(new Set());
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Bulk import Edition 14 students
  const importEdition14Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < EDITION_14_STUDENTS.length; i++) {
        const student = EDITION_14_STUDENTS[i];
        setImportProgress({ current: i + 1, total: EDITION_14_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: EDITION_14_ID,
              payment_status: "CONFIRMED_15K"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.data?.error || response.error?.message || 'Unknown error'
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Edition 14 students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Edition 15 students
  const importEdition15Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < EDITION_15_STUDENTS.length; i++) {
        const student = EDITION_15_STUDENTS[i];
        setImportProgress({ current: i + 1, total: EDITION_15_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: EDITION_15_ID,
              payment_status: "CONFIRMED_15K"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.data?.error || response.error?.message || 'Unknown error'
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Edition 15 students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Creators Edition 1 Bali students
  const importCreatorsE1Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < CREATORS_E1_STUDENTS.length; i++) {
        const student = CREATORS_E1_STUDENTS[i];
        setImportProgress({ current: i + 1, total: CREATORS_E1_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Bali",
              edition_id: CREATORS_E1_ID,
              payment_status: "BALANCE_PAID"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.data?.error || response.error?.message || 'Unknown error'
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Creators E1 students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Creators Edition 2 Goa students (16 students)
  const importCreatorsE2GoaMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < CREATORS_E2_GOA_STUDENTS.length; i++) {
        const student = CREATORS_E2_GOA_STUDENTS[i];
        setImportProgress({ current: i + 1, total: CREATORS_E2_GOA_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: CREATORS_E2_GOA_ID,
              payment_status: "BALANCE_PAID"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.data?.error || response.error?.message || 'Unknown error'
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Creators E2 Goa students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Writing Edition 5 Goa students (27 students)
  const importWritingE5Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < WRITING_E5_STUDENTS.length; i++) {
        const student = WRITING_E5_STUDENTS[i];
        setImportProgress({ current: i + 1, total: WRITING_E5_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: WRITING_E5_ID,
              payment_status: "BALANCE_PAID"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.data?.error || response.error?.message || 'Unknown error'
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Writing E5 Goa students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Writing Edition 4 Goa students (24 students)
  const importWritingE4Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < WRITING_E4_STUDENTS.length; i++) {
        const student = WRITING_E4_STUDENTS[i];
        setImportProgress({ current: i + 1, total: WRITING_E4_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: WRITING_E4_ID,
              payment_status: "BALANCE_PAID"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.data?.error || response.error?.message || 'Unknown error'
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Writing E4 Goa students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Edition 16/17 students with payment config
  const importEdition16_17Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { created: 0, reset: 0, failed: 0, errors: [] as { name: string; error: string }[] };

      for (let i = 0; i < EDITION_16_17_STUDENTS.length; i++) {
        const student = EDITION_16_17_STUDENTS[i];
        setImportProgress({ current: i + 1, total: EDITION_16_17_STUDENTS.length });

        // Always produce Title-cased first name: e.g. "NASAR muhammed" -> "Nasar"
        const rawFirst = (student.full_name || '').trim().split(/\s+/)[0] || '';
        const firstName = rawFirst
          ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()
          : '';
        const password = `${firstName}@Forge!`;

        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password,
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: student.edition_id,
              payment_status: student.payment_status
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({
              name: student.full_name,
              error: response.data?.error || response.error?.message || 'Unknown error'
            });
          } else {
            if (response.data?.action === 'updated') results.reset++;
            else results.created++;

            // If 15k user, upsert payment_config (safe on re-run — won't duplicate)
            if (student.payment_status === 'CONFIRMED_15K' && student.payment_link && student.balance_due && response.data?.user_id) {
              const programmeTotal = student.balance_due + 15000;
              const { error: paymentError } = await supabase
                .from('payment_config')
                .upsert(
                  {
                    user_id: response.data.user_id,
                    programme_total: programmeTotal,
                    deposit_paid: 15000,
                    balance_due: student.balance_due,
                    payment_link: student.payment_link,
                    is_deposit_verified: true
                  },
                  { onConflict: 'user_id' }
                );
              if (paymentError) {
                console.error(`Payment config error for ${student.full_name}:`, paymentError);
              }
            }
          }
        } catch (err) {
          results.failed++;
          results.errors.push({
            name: student.full_name,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      const ok = data.created + data.reset;
      if (data.failed > 0) {
        toast.error(`Imported ${ok} (${data.created} new, ${data.reset} password-reset), ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Done — ${data.created} created, ${data.reset} existing users had passwords reset`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk CSV import — generic, admin provides the data.
  // Expected columns (comma-separated, one row per line, header optional):
  //   full_name, email, phone, payment_status, balance_due, payment_link
  // - payment_status: BALANCE_PAID | CONFIRMED_15K (defaults to BALANCE_PAID)
  // - balance_due + payment_link are only used for CONFIRMED_15K rows
  // Blank lines and lines starting with '#' are ignored. A header row where
  // the first cell equals 'full_name' (case-insensitive) is also skipped.
  const bulkImportMutation = useMutation({
    mutationFn: async () => {
      const editionId = bulkImportEditionId === 'none' ? null : bulkImportEditionId;

      // Parse CSV
      type Row = {
        full_name: string;
        email: string;
        phone: string;
        payment_status: 'BALANCE_PAID' | 'CONFIRMED_15K';
        balance_due: number | null;
        payment_link: string | null;
      };
      const rows: Row[] = [];
      const parseErrors: string[] = [];
      const lines = bulkImportCsv.split(/\r?\n/);
      lines.forEach((raw, idx) => {
        const line = raw.trim();
        if (!line || line.startsWith('#')) return;
        const parts = line.split(',').map(p => p.trim());
        // Skip a header row
        if (idx === 0 && parts[0].toLowerCase() === 'full_name') return;
        const [full_name, email, phone, paymentStatusRaw, balanceDueRaw, paymentLinkRaw] = parts;
        if (!full_name || !email) {
          parseErrors.push(`Line ${idx + 1}: missing full_name or email`);
          return;
        }
        const payment_status: Row['payment_status'] =
          paymentStatusRaw && paymentStatusRaw.toUpperCase() === 'CONFIRMED_15K'
            ? 'CONFIRMED_15K'
            : 'BALANCE_PAID';
        const balance_due = balanceDueRaw ? Number(balanceDueRaw) : null;
        const payment_link = paymentLinkRaw || null;
        rows.push({
          full_name,
          email,
          phone: phone || '',
          payment_status,
          balance_due: Number.isFinite(balance_due as number) ? (balance_due as number) : null,
          payment_link,
        });
      });

      if (parseErrors.length > 0) {
        throw new Error(parseErrors.slice(0, 5).join('\n'));
      }
      if (rows.length === 0) {
        throw new Error('No rows to import — check your CSV.');
      }

      const results = { created: 0, reset: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      for (let i = 0; i < rows.length; i++) {
        const student = rows[i];
        setImportProgress({ current: i + 1, total: rows.length });
        // Always produce Title-cased first name: e.g. "NASAR muhammed" -> "Nasar"
        const rawFirst = (student.full_name || '').trim().split(/\s+/)[0] || '';
        const firstName = rawFirst
          ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()
          : '';
        const password = `${firstName}@Forge!`;
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password,
              full_name: student.full_name,
              phone: student.phone,
              city: bulkImportCity || 'Goa',
              edition_id: editionId,
              payment_status: student.payment_status,
            },
          });
          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({
              name: student.full_name,
              error: response.data?.error || response.error?.message || 'Unknown error',
            });
            continue;
          }
          if (response.data?.action === 'updated') results.reset++;
          else results.created++;

          if (
            student.payment_status === 'CONFIRMED_15K' &&
            student.payment_link &&
            student.balance_due &&
            response.data?.user_id
          ) {
            const programmeTotal = student.balance_due + 15000;
            const { error: paymentError } = await supabase
              .from('payment_config')
              .upsert(
                {
                  user_id: response.data.user_id,
                  programme_total: programmeTotal,
                  deposit_paid: 15000,
                  balance_due: student.balance_due,
                  payment_link: student.payment_link,
                  is_deposit_verified: true,
                },
                { onConflict: 'user_id' }
              );
            if (paymentError) console.error(`Payment config for ${student.full_name}:`, paymentError);
          }
        } catch (err) {
          results.failed++;
          results.errors.push({
            name: student.full_name,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      setBulkImportResults(data);
      const ok = data.created + data.reset;
      if (data.failed > 0) {
        toast.error(`Imported ${ok} (${data.created} new, ${data.reset} reset), ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n'),
        });
      } else {
        toast.success(`Done — ${data.created} created, ${data.reset} password-reset`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    },
  });

  // Grant admin mutation — also detaches the user from any cohort and resets
  // their student-lifecycle state, since staff accounts shouldn't be counted
  // as students in any edition.
  const grantAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: true,
          // NOTE: `cohort_type` does not exist on profiles — cohort is derived
          // from the edition via editions.cohort_type. Nulling edition_id is
          // enough to detach the user from any cohort.
          edition_id: null,
          payment_status: null,
          unlock_level: null,
          forge_mode: null,
          profile_setup_completed: false,
          ky_form_completed: false,
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Admin access granted — user moved to no cohort');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      setAdminSearchResults([]);
      setAdminSearchQuery('');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Revoke admin mutation
  const revokeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Admin access revoked');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Admin search — partial match on full_name OR email (case-insensitive)
  const handleAdminSearch = async () => {
    const q = adminSearchQuery.trim();
    if (!q) return;
    setAdminSearchLoading(true);
    setAdminSearchError(null);
    setAdminSearchResults([]);
    try {
      const pattern = `%${q}%`;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
        .order('full_name', { ascending: true })
        .limit(10);
      if (error) throw error;
      if (!data || data.length === 0) {
        setAdminSearchError('No users match that name or email.');
      } else {
        setAdminSearchResults(data as Profile[]);
      }
    } catch (e: any) {
      setAdminSearchError(e.message);
    } finally {
      setAdminSearchLoading(false);
    }
  };

  // ─── Mentor role lookups for the users list ───
  const { data: mentorRoleSet } = useMentorRoleSet();
  const grantMentorRole = useGrantMentorRole();
  const revokeMentorRole = useRevokeMentorRole();
  const bulkGrantMentor = useBulkGrantMentorRole();
  const updateMentorCapacity = useUpdateMentorCapacity();
  const [mentorDialog, setMentorDialog] = useState<{
    user: { id: string; full_name: string | null; email: string | null };
    mode: 'grant' | 'revoke';
  } | null>(null);
  const [mentorCapacity, setMentorCapacity] = useState<number>(5);
  const [bulkPromoteOpen, setBulkPromoteOpen] = useState(false);
  const [bulkCapacity, setBulkCapacity] = useState<number>(5);

  const filteredUsers = useMemo(() => {
    return users?.filter(user => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEdition =
        selectedEditionFilter === 'all' ||
        (selectedEditionFilter === 'none' && !user.edition_id) ||
        (selectedEditionFilter === 'waitlist' && !user.edition_id &&
          (user.payment_status === 'CONFIRMED_15K' || user.payment_status === 'BALANCE_PAID')) ||
        user.edition_id === selectedEditionFilter;

      return matchesSearch && matchesEdition;
    });
  }, [users, searchQuery, selectedEditionFilter]);

  const getEditionName = (editionId: string | null) => {
    if (!editionId || !allEditions) return '-';
    const edition = allEditions.find(e => e.id === editionId);
    return edition?.name || '-';
  };

  // Get editions with users for cohort view (sorted by user count)
  const editionsWithUsers = useMemo(() => {
    if (!allEditions) return [];
    
    return allEditions
      .map(edition => ({
        edition,
        userCount: editionUserCounts.get(edition.id) || 0
      }))
      .filter(item => item.userCount > 0)
      .sort((a, b) => b.userCount - a.userCount);
  }, [allEditions, editionUserCounts]);

  const unassignedCount = editionUserCounts.get(null) || 0;

  // Waitlisted = paid but not in any edition
  const waitlistedUsers = useMemo(() => {
    return (users || []).filter(u =>
      !u.edition_id &&
      (u.payment_status === 'CONFIRMED_15K' || u.payment_status === 'BALANCE_PAID')
    );
  }, [users]);
  const waitlistedCount = waitlistedUsers.length;

  // Get selectable users (exclude hardcoded admin email as safety net)
  const selectableUsers = filteredUsers?.filter(u => u.email?.toLowerCase() !== 'admin@admin.in') || [];

  // Toggle single user selection
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  // Toggle all visible users
  const toggleAllSelection = () => {
    if (selectedUserIds.size === selectableUsers.length && selectableUsers.length > 0) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(selectableUsers.map(u => u.id)));
    }
  };

  const isAllSelected = selectableUsers.length > 0 && selectedUserIds.size === selectableUsers.length;
  const isSomeSelected = selectedUserIds.size > 0 && selectedUserIds.size < selectableUsers.length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            {users?.length || 0} students
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setBulkImportResults(null);
              setBulkImportOpen(true);
            }}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk Import (CSV)
          </Button>
          {viewMode === 'list' && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkCapacity(5);
                  setBulkPromoteOpen(true);
                }}
                className="gap-2"
                disabled={selectedUserIds.size === 0}
                title="Promote selected users to mentor role"
              >
                <UserPlus className="w-4 h-4" />
                Promote to mentor ({selectedUserIds.size})
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="gap-2"
                disabled={selectedUserIds.size === 0}
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedUserIds.size})
              </Button>
            </>
          )}
          <Button 
            variant="outline"
            onClick={() => importEdition14Mutation.mutate()} 
            className="gap-2"
            disabled={importEdition14Mutation.isPending}
          >
            {importEdition14Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Edition 14 (24)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importEdition15Mutation.mutate()} 
            className="gap-2"
            disabled={importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importEdition15Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Edition 15 (24)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importCreatorsE1Mutation.mutate()} 
            className="gap-2"
            disabled={importCreatorsE1Mutation.isPending || importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importCreatorsE1Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Creators E1 (10)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importCreatorsE2GoaMutation.mutate()} 
            className="gap-2"
            disabled={importCreatorsE2GoaMutation.isPending || importCreatorsE1Mutation.isPending || importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importCreatorsE2GoaMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Creators E2 Goa (16)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importWritingE5Mutation.mutate()} 
            className="gap-2"
            disabled={importWritingE5Mutation.isPending || importWritingE4Mutation.isPending || importCreatorsE2GoaMutation.isPending || importCreatorsE1Mutation.isPending || importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importWritingE5Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Writing E5 (27)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importWritingE4Mutation.mutate()} 
            className="gap-2"
            disabled={importWritingE4Mutation.isPending || importWritingE5Mutation.isPending || importCreatorsE2GoaMutation.isPending || importCreatorsE1Mutation.isPending || importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importWritingE4Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Writing E4 (24)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importEdition16_17Mutation.mutate()} 
            className="gap-2"
            disabled={importEdition16_17Mutation.isPending || importWritingE4Mutation.isPending || importWritingE5Mutation.isPending || importCreatorsE2GoaMutation.isPending || importCreatorsE1Mutation.isPending || importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importEdition16_17Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import E16/E17 (34)
              </>
            )}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'users' | 'admin-accounts')} className="space-y-6">
        <TabsList className="bg-card/50">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="admin-accounts" className="gap-2">
            <Crown className="w-4 h-4" />
            Admin Accounts
            {adminUsers && adminUsers.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{adminUsers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">

      {/* View Toggle + Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* View Mode Toggle */}
        <div className="flex border border-border/50 rounded-lg p-1 bg-card/30">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'cohort' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cohort')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            By Cohort
          </Button>
        </div>

        {/* Edition Filter (only in list view) */}
        {viewMode === 'list' && (
          <>
            <Select
              value={selectedEditionFilter}
              onValueChange={setSelectedEditionFilter}
            >
              <SelectTrigger className="w-[280px] bg-card/50">
                <SelectValue placeholder="All Editions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Editions ({users?.length || 0})</SelectItem>
                <SelectItem value="waitlist">Waitlisted Students ({waitlistedCount})</SelectItem>
                <SelectItem value="none">No Edition Assigned ({unassignedCount})</SelectItem>
                {allEditions?.map(edition => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name} ({editionUserCounts.get(edition.id) || 0})
                    {edition.is_archived ? ' [Archived]' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50"
              />
            </div>
          </>
        )}
      </div>

      {/* Cohort View */}
      {viewMode === 'cohort' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {editionsWithUsers.map(({ edition, userCount }) => (
            <CohortCard
              key={edition.id}
              edition={edition}
              userCount={userCount}
              isSelected={selectedEditionFilter === edition.id}
              onSelect={() => {
                setSelectedEditionFilter(edition.id);
                setViewMode('list');
              }}
            />
          ))}
          {waitlistedCount > 0 && (
            <CohortCard
              edition={null}
              userCount={waitlistedCount}
              variant="waitlist"
              isSelected={selectedEditionFilter === 'waitlist'}
              onSelect={() => {
                setSelectedEditionFilter('waitlist');
                setViewMode('list');
              }}
            />
          )}
        </div>
      )}

      {/* Users Table (List View) */}
      {viewMode === 'list' && (
        <div className="rounded-lg border border-border/50 bg-card/30">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        (el as unknown as HTMLInputElement).indeterminate = isSomeSelected;
                      }
                    }}
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Edition</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>KYF</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => {
                  const isAdmin = user.is_admin === true || user.email?.toLowerCase() === 'admin@admin.in';
                  const isSelected = selectedUserIds.has(user.id);
                  return (
                    <TableRow 
                      key={user.id} 
                      className={isSelected ? 'bg-primary/5' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          disabled={isAdmin}
                          aria-label={`Select ${user.full_name || user.email}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{user.full_name || '-'}</span>
                          {mentorRoleSet?.has(user.id) && (
                            <MentorCapacityBadge
                              userId={user.id}
                              capacity={mentorRoleSet.get(user.id)?.capacity ?? 5}
                              onUpdate={async (next) => {
                                try {
                                  await updateMentorCapacity.mutateAsync({
                                    userId: user.id,
                                    capacity: next,
                                  });
                                  toast.success(`Capacity set to ${next}`);
                                  queryClient.invalidateQueries({ queryKey: ['admin', 'mentor-role-set'] });
                                } catch (e) {
                                  toast.error(`Could not update: ${errMessage(e)}`);
                                }
                              }}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.city || '-'}</TableCell>
                      <TableCell>{getEditionName(user.edition_id)}</TableCell>
                      <TableCell>
                        <Select
                          value={user.payment_status}
                          onValueChange={(value: PaymentStatus) => {
                            updateUserMutation.mutate({ id: user.id, payment_status: value });
                          }}
                        >
                          <SelectTrigger className="h-7 w-[90px] text-xs border-none bg-transparent hover:bg-muted/50 p-1">
                            <Badge variant={user.payment_status === 'BALANCE_PAID' ? 'default' : 'secondary'} className="text-[10px]">
                              {user.payment_status === 'BALANCE_PAID' ? 'Full' : '₹15K'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONFIRMED_15K">₹15K Confirmed</SelectItem>
                            <SelectItem value="BALANCE_PAID">Balance Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.kyf_completed ? 'default' : 'outline'}>
                          {user.kyf_completed ? 'Done' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingUser(user)}
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {mentorRoleSet?.has(user.id) ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:bg-primary/10"
                              onClick={() => {
                                setMentorDialog({
                                  user: { id: user.id, full_name: user.full_name ?? null, email: user.email ?? null },
                                  mode: 'revoke',
                                });
                              }}
                              title="Revoke mentor role"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setMentorCapacity(5);
                                setMentorDialog({
                                  user: { id: user.id, full_name: user.full_name ?? null, email: user.email ?? null },
                                  mode: 'grant',
                                });
                              }}
                              disabled={isAdmin && !user.is_admin /* noop, placeholder */}
                              title="Make mentor"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setUserToDelete(user)}
                            disabled={isAdmin}
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setSearchParams({});
        }}
        editions={editions || []}
        onSubmit={(data) => createUserMutation.mutate(data)}
        isLoading={createUserMutation.isPending}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        onClose={() => setEditingUser(null)}
        editions={editions || []}
        onSubmit={(data) => updateUserMutation.mutate(data)}
        isLoading={updateUserMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.full_name || userToDelete?.email}</strong>? 
              This will permanently remove their account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete {selectedUserIds.size} Users
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will permanently delete <strong>{selectedUserIds.size} selected users</strong> and all their data.</p>
              <p className="text-destructive font-medium">This action cannot be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => bulkDeleteMutation.mutate(Array.from(selectedUserIds))}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedUserIds.size} Users`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Bulk Actions Toolbar */}
      {selectedUserIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border shadow-2xl animate-in slide-in-from-bottom-4">
          <span className="text-sm font-medium text-foreground">{selectedUserIds.size} selected</span>
          <div className="w-px h-6 bg-border" />
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => {
            const selected = (users || []).filter(u => selectedUserIds.has(u.id));
            const csv = ['Name,Email,City,Payment,KYF'].concat(
              selected.map(u => `"${u.full_name || ''}","${u.email || ''}","${u.city || ''}","${u.payment_status}","${u.kyf_completed}"`)
            ).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'selected-users.csv'; a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${selected.length} users`);
          }}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button size="sm" variant="destructive" className="gap-1.5 h-8 text-xs" onClick={() => setShowBulkDeleteConfirm(true)}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSelectedUserIds(new Set())}>
            Cancel
          </Button>
        </div>
      )}
        </TabsContent>

        <TabsContent value="admin-accounts">
          <AdminAccountsTab
            adminUsers={adminUsers || []}
            adminUsersLoading={adminUsersLoading}
            adminSearchQuery={adminSearchQuery}
            setAdminSearchQuery={setAdminSearchQuery}
            adminSearchResults={adminSearchResults}
            adminSearchLoading={adminSearchLoading}
            adminSearchError={adminSearchError}
            onSearch={handleAdminSearch}
            onGrant={(id) => grantAdminMutation.mutate(id)}
            onRevoke={(id) => revokeAdminMutation.mutate(id)}
            isGranting={grantAdminMutation.isPending}
            isRevoking={revokeAdminMutation.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* Bulk CSV Import Dialog */}
      <Dialog
        open={bulkImportOpen}
        onOpenChange={(open) => {
          if (!bulkImportMutation.isPending) {
            setBulkImportOpen(open);
            if (!open) {
              setBulkImportCsv('');
              setBulkImportResults(null);
            }
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Bulk Import Users (CSV)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Edition</Label>
                <Select value={bulkImportEditionId} onValueChange={setBulkImportEditionId}>
                  <SelectTrigger><SelectValue placeholder="Choose edition..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No edition / Waitlist —</SelectItem>
                    {editions?.filter(e => !e.is_archived).map(ed => (
                      <SelectItem key={ed.id} value={ed.id}>{ed.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default City</Label>
                <Input
                  value={bulkImportCity}
                  onChange={e => setBulkImportCity(e.target.value)}
                  placeholder="Goa"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>CSV Data</Label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline">
                    <FileUp className="w-3.5 h-3.5" />
                    Upload .csv
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const text = await file.text();
                        setBulkImportCsv(text);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const template =
                        'full_name,email,phone,payment_status,balance_due,payment_link\n' +
                        'Rahul Reddy,rahul@example.com,9876543210,BALANCE_PAID,,\n' +
                        'Priya Sharma,priya@example.com,9876543211,CONFIRMED_15K,70000,https://rzp.io/xyz\n';
                      setBulkImportCsv(template);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Insert template
                  </button>
                </div>
              </div>
              <Textarea
                value={bulkImportCsv}
                onChange={e => setBulkImportCsv(e.target.value)}
                placeholder="full_name,email,phone,payment_status,balance_due,payment_link&#10;John Doe,john@example.com,9876543210,BALANCE_PAID,,"
                rows={10}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                One student per line. Columns: <code>full_name, email, phone, payment_status, balance_due, payment_link</code>.
                Password is auto-set to <code>{'{FirstName}@Forge!'}</code>. Existing users will have their password reset to match.
              </p>
            </div>

            {importProgress && (
              <div className="text-sm text-muted-foreground">
                Importing {importProgress.current} / {importProgress.total}…
              </div>
            )}

            {bulkImportResults && (
              <div className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-2">
                <p className="text-sm font-medium">
                  {bulkImportResults.created} created · {bulkImportResults.reset} password-reset · {bulkImportResults.failed} failed
                </p>
                {bulkImportResults.errors.length > 0 && (
                  <div className="text-xs text-destructive space-y-1 max-h-32 overflow-auto">
                    {bulkImportResults.errors.map((e, i) => (
                      <div key={i}><strong>{e.name}:</strong> {e.error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setBulkImportOpen(false)} disabled={bulkImportMutation.isPending}>
              Close
            </Button>
            <Button
              onClick={() => bulkImportMutation.mutate()}
              disabled={bulkImportMutation.isPending || !bulkImportCsv.trim()}
            >
              {bulkImportMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import Users
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Grant / revoke mentor role ─────────────────────────────── */}
      <AlertDialog
        open={!!mentorDialog}
        onOpenChange={(v) => { if (!v) setMentorDialog(null); }}
      >
        <AlertDialogContent>
          {mentorDialog?.mode === 'grant' ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Make {mentorDialog.user.full_name ?? 'this user'} a mentor?</AlertDialogTitle>
                <AlertDialogDescription>
                  Grants the <code className="text-xs">mentor</code> role and creates their mentor
                  profile. They'll be able to access the mentor workspace once the{' '}
                  <code className="text-xs">mentors_enabled</code> feature flag is on. Students are
                  assigned separately from Admin → Mentor assignments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div>
                <Label htmlFor="mentor-cap">Initial capacity (1–20)</Label>
                <Input
                  id="mentor-cap"
                  type="number"
                  min={1}
                  max={20}
                  value={mentorCapacity}
                  onChange={(e) => setMentorCapacity(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="mt-1 w-24"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  How many students this mentor can take on at once. Editable later.
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await grantMentorRole.mutateAsync({
                        userId: mentorDialog.user.id,
                        capacity: mentorCapacity,
                      });
                      toast.success(`${mentorDialog.user.full_name ?? 'User'} is now a mentor`);
                      setMentorDialog(null);
                      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                    } catch (e) {
                      toast.error(`Could not grant mentor role: ${errMessage(e)}`);
                    }
                  }}
                  disabled={grantMentorRole.isPending}
                >
                  {grantMentorRole.isPending ? 'Granting…' : 'Make mentor'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : mentorDialog?.mode === 'revoke' ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke mentor role from {mentorDialog.user.full_name ?? 'this user'}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They'll lose access to the mentor workspace. Their existing student assignments and
                  past notes / reviews stay intact — if you grant the role back later, nothing is
                  lost. To fully detach assigned students, go to Admin → Mentor assignments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    try {
                      await revokeMentorRole.mutateAsync({ userId: mentorDialog.user.id });
                      toast.success('Mentor role revoked');
                      setMentorDialog(null);
                      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                    } catch (e) {
                      toast.error(`Could not revoke: ${errMessage(e)}`);
                    }
                  }}
                  disabled={revokeMentorRole.isPending}
                >
                  {revokeMentorRole.isPending ? 'Revoking…' : 'Revoke mentor role'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Bulk promote selected users to mentors ─── */}
      <AlertDialog open={bulkPromoteOpen} onOpenChange={setBulkPromoteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Promote {selectedUserIds.size} user{selectedUserIds.size === 1 ? '' : 's'} to mentor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Each selected user gets the <code className="text-xs">mentor</code> role and a mentor
              profile with the capacity below. Users who are already mentors are skipped (no
              duplicates). Capacities can be edited inline on the table afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label htmlFor="bulk-cap">Initial capacity (1–20)</Label>
            <Input
              id="bulk-cap"
              type="number"
              min={1}
              max={20}
              value={bulkCapacity}
              onChange={(e) =>
                setBulkCapacity(Math.max(1, Math.min(20, Number(e.target.value))))
              }
              className="mt-1 w-24"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Sets capacity only for users who don't already have a mentor profile. Existing
              capacities are preserved.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  const ids = Array.from(selectedUserIds);
                  const result = await bulkGrantMentor.mutateAsync({
                    userIds: ids,
                    capacity: bulkCapacity,
                  });
                  toast.success(`Promoted ${result.granted} user${result.granted === 1 ? '' : 's'}`);
                  setBulkPromoteOpen(false);
                  setSelectedUserIds(new Set());
                  queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                } catch (e) {
                  toast.error(`Bulk promote failed: ${errMessage(e)}`);
                }
              }}
              disabled={bulkGrantMentor.isPending || selectedUserIds.size === 0}
            >
              {bulkGrantMentor.isPending ? 'Promoting…' : 'Promote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Inline mentor-capacity editor: click the Mentor badge to adjust.
// ────────────────────────────────────────────────────────────────────────
const CAPACITY_MIN = 1;
const CAPACITY_MAX = 20;
const MentorCapacityBadge: React.FC<{
  userId: string;
  capacity: number;
  onUpdate: (next: number) => Promise<void>;
}> = ({ capacity, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number>(capacity);
  const [pending, setPending] = useState(false);

  // Reset draft to live capacity each time the popover opens.
  React.useEffect(() => {
    if (open) setDraft(capacity);
  }, [open, capacity]);

  const dec = () => setDraft((v) => Math.max(CAPACITY_MIN, v - 1));
  const inc = () => setDraft((v) => Math.min(CAPACITY_MAX, v + 1));
  const apply = async () => {
    if (draft === capacity) {
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      await onUpdate(draft);
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          role="button"
          tabIndex={0}
          className="h-5 cursor-pointer border-primary/30 bg-primary/5 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary hover:bg-primary/10"
          title="Click to adjust capacity"
        >
          <GraduationCap className="mr-0.5 h-3 w-3" />
          Mentor · {capacity}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Capacity
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={dec}
            disabled={draft <= CAPACITY_MIN || pending}
          >
            −
          </Button>
          <Input
            type="number"
            min={CAPACITY_MIN}
            max={CAPACITY_MAX}
            value={draft}
            onChange={(e) =>
              setDraft(
                Math.max(CAPACITY_MIN, Math.min(CAPACITY_MAX, Number(e.target.value) || CAPACITY_MIN)),
              )
            }
            className="h-7 w-14 text-center"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={inc}
            disabled={draft >= CAPACITY_MAX || pending}
          >
            +
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Range {CAPACITY_MIN}–{CAPACITY_MAX}. Note: this won't drop below the mentor's current
          load — that's enforced when changing it on the assignments page.
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button size="sm" onClick={apply} disabled={pending || draft === capacity}>
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Admin Accounts Tab Component
function AdminAccountsTab({
  adminUsers,
  adminUsersLoading,
  adminSearchQuery,
  setAdminSearchQuery,
  adminSearchResults,
  adminSearchLoading,
  adminSearchError,
  onSearch,
  onGrant,
  onRevoke,
  isGranting,
  isRevoking,
}: {
  adminUsers: Profile[];
  adminUsersLoading: boolean;
  adminSearchQuery: string;
  setAdminSearchQuery: (q: string) => void;
  adminSearchResults: Profile[];
  adminSearchLoading: boolean;
  adminSearchError: string | null;
  onSearch: () => void;
  onGrant: (id: string) => void;
  onRevoke: (id: string) => void;
  isGranting: boolean;
  isRevoking: boolean;
}) {
  return (
    <div className="space-y-6 pt-4">
      {/* Grant Admin Access */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Grant Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email..."
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="flex-1"
            />
            <Button onClick={onSearch} disabled={adminSearchLoading || !adminSearchQuery.trim()}>
              {adminSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>

          {adminSearchError && (
            <p className="text-sm text-red-400">{adminSearchError}</p>
          )}

          {adminSearchResults.length > 0 && (
            <div className="space-y-2">
              {adminSearchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{result.full_name || 'No Name'}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.email}</p>
                  </div>
                  {result.is_admin ? (
                    <Badge variant="outline" className="text-amber-400 border-amber-400/40 flex-shrink-0">
                      Already Admin
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-shrink-0"
                      onClick={() => onGrant(result.id)}
                      disabled={isGranting}
                    >
                      {isGranting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                      Grant Admin Access
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Current Admins
            {!adminUsersLoading && (
              <Badge variant="secondary" className="ml-1">{adminUsers.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminUsersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : adminUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No admin accounts found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.full_name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                            Revoke Admin
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Admin Access?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove admin privileges from <strong>{admin.full_name || admin.email}</strong>. They will no longer be able to access the admin panel.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onRevoke(admin.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Create User Dialog Component
function CreateUserDialog({
  open,
  onOpenChange,
  editions,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editions: Edition[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
    edition_id: '',
    specialty: '',
    payment_status: 'CONFIRMED_15K' as PaymentStatus
  });
  const [isMentor, setIsMentor] = useState(false);
  const [mentorCapacity, setMentorCapacity] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMentor) {
      // Mentor branch: cohort / specialty / payment are ignored. The mutation
      // will grant the role and clear the student-lifecycle fields after
      // create-user completes.
      onSubmit({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        city: formData.city || undefined,
        // The edge function still requires payment_status — pass a placeholder.
        payment_status: 'CONFIRMED_15K' as PaymentStatus,
        isMentor: true,
        mentorCapacity,
      });
      return;
    }
    onSubmit({
      ...formData,
      edition_id: formData.edition_id || undefined,
      phone: formData.phone || undefined,
      city: formData.city || undefined,
      specialty: formData.specialty || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        {/* Role switcher — mentors don't need cohort / payment fields. */}
        <div className="mb-1 flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
          <div className="flex-1">
            <Label htmlFor="create-as-mentor" className="font-medium">
              Create as mentor
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isMentor
                ? "Skips cohort / payment / specialty. They'll get the mentor role and a profile with the capacity below."
                : 'Toggle on for staff/mentor accounts that don\'t belong to a cohort.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            id="create-as-mentor"
            aria-checked={isMentor}
            onClick={() => setIsMentor((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
              isMentor ? 'bg-primary border-primary' : 'bg-muted border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
                isMentor ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Password *</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>
          {!isMentor && (
            <>
              <div className="space-y-2">
                <Label>Edition</Label>
                <Select
                  value={formData.edition_id}
                  onValueChange={(value) => setFormData({ ...formData, edition_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select edition" />
                  </SelectTrigger>
                  <SelectContent>
                    {editions.map((edition) => (
                      <SelectItem key={edition.id} value={edition.id}>
                        {edition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g., Filmmaking, Writing"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value: PaymentStatus) => setFormData({ ...formData, payment_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED_15K">₹15K Confirmed</SelectItem>
                    <SelectItem value="BALANCE_PAID">Balance Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {isMentor && (
            <div className="space-y-2">
              <Label htmlFor="mentor-create-cap">Mentor capacity (1–20)</Label>
              <Input
                id="mentor-create-cap"
                type="number"
                min={1}
                max={20}
                value={mentorCapacity}
                onChange={(e) =>
                  setMentorCapacity(Math.max(1, Math.min(20, Number(e.target.value) || 5)))
                }
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Default students this mentor can take on. Editable later inline on the users
                table or on Mentor assignments.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isMentor ? 'Create mentor' : 'Create User'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog Component
function EditUserDialog({
  user,
  onClose,
  editions,
  onSubmit,
  isLoading
}: {
  user: Profile | null;
  onClose: () => void;
  editions: Edition[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [transferFee, setTransferFee] = useState('');
  const [paymentConfigId, setPaymentConfigId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const isWaitlisted = !!user && !user.edition_id &&
    (user.payment_status === 'CONFIRMED_15K' || user.payment_status === 'BALANCE_PAID');

  const { data: paymentConfig } = useQuery({
    queryKey: ['payment-config-edit', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_config')
        .select('id, transfer_fee')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isWaitlisted && !!user,
  });

  const saveTransferFeeMutation = useMutation({
    mutationFn: async () => {
      const fee = transferFee !== '' ? Number(transferFee) : null;
      if (paymentConfigId) {
        const { error } = await supabase
          .from('payment_config')
          .update({ transfer_fee: fee } as any)
          .eq('id', paymentConfigId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_config')
          .insert({ user_id: user!.id, transfer_fee: fee } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-config-edit', user?.id] }),
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        phone: user.phone,
        city: user.city,
        edition_id: user.edition_id,
        specialty: user.specialty,
        payment_status: user.payment_status,
        kyf_completed: user.kyf_completed,
        bio: user.bio,
        tagline: user.tagline,
        instagram_handle: user.instagram_handle,
        twitter_handle: user.twitter_handle,
        profile_setup_completed: user.profile_setup_completed,
        ky_form_completed: user.ky_form_completed,
      });
    }
  }, [user]);

  React.useEffect(() => {
    if (paymentConfig) {
      setTransferFee(paymentConfig.transfer_fee != null ? String(paymentConfig.transfer_fee) : '');
      setPaymentConfigId(paymentConfig.id);
    }
  }, [paymentConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onSubmit({ id: user.id, ...formData });
    if (isWaitlisted) {
      saveTransferFeeMutation.mutate();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email || ''} disabled className="opacity-50" />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Filmmaker | Storyteller"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              placeholder="User bio..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                value={formData.instagram_handle || ''}
                onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                placeholder="@handle"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter</Label>
              <Input
                value={formData.twitter_handle || ''}
                onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                placeholder="@handle"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Edition</Label>
            <Select
              value={formData.edition_id || ''}
              onValueChange={(value) => setFormData({ ...formData, edition_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select edition" />
              </SelectTrigger>
              <SelectContent>
                {editions.map((edition) => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Specialty</Label>
            <Input
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value: PaymentStatus) => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED_15K">₹15K Confirmed</SelectItem>
                <SelectItem value="BALANCE_PAID">Balance Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="profile_setup"
                checked={formData.profile_setup_completed || false}
                onCheckedChange={(checked) => setFormData({ ...formData, profile_setup_completed: !!checked })}
              />
              <Label htmlFor="profile_setup" className="text-sm">Profile Setup Done</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="ky_form"
                checked={formData.ky_form_completed || false}
                onCheckedChange={(checked) => setFormData({ ...formData, ky_form_completed: !!checked })}
              />
              <Label htmlFor="ky_form" className="text-sm">KY Form Done</Label>
            </div>
          </div>
          {isWaitlisted && (
            <div className="space-y-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Label className="text-amber-400 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                Transfer Fee (₹)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={transferFee}
                onChange={(e) => setTransferFee(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Fee charged when this student is moved to a new edition
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading || saveTransferFeeMutation.isPending}>
            {(isLoading || saveTransferFeeMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
